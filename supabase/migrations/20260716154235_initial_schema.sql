-- AX Fit: org friction diagnostic schema
-- Profiles, organizations, members, diagnostic sessions & responses
-- RLS enabled on all public tables; explicit grants for Data API.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.org_member_role as enum ('owner', 'hr', 'member');
create type public.diagnostic_status as enum ('draft', 'active', 'closed');
create type public.role_layer as enum ('executive', 'manager', 'ic');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  employee_range text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_created_by_idx on public.organizations (created_by);

-- ---------------------------------------------------------------------------
-- Organization members
-- ---------------------------------------------------------------------------
create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index org_members_user_id_idx on public.org_members (user_id);
create index org_members_org_id_idx on public.org_members (org_id);

-- ---------------------------------------------------------------------------
-- Diagnostic sessions
-- ---------------------------------------------------------------------------
create table public.diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null default 'AX Friction Diagnostic',
  status public.diagnostic_status not null default 'draft',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagnostic_sessions_org_id_idx on public.diagnostic_sessions (org_id);
create index diagnostic_sessions_status_idx on public.diagnostic_sessions (status);

-- ---------------------------------------------------------------------------
-- Diagnostic responses (per participant)
-- ---------------------------------------------------------------------------
create table public.diagnostic_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.diagnostic_sessions (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  role_layer public.role_layer not null,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagnostic_responses_session_id_idx on public.diagnostic_responses (session_id);
create index diagnostic_responses_user_id_idx on public.diagnostic_responses (user_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- Membership checks are SECURITY DEFINER so RLS policies that call them
-- do not recurse when reading org_members. They only return true for
-- the calling user (auth.uid()) — no cross-user data exposure.
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = target_org_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = target_org_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'hr')
  );
$$;

-- Auto-create profile + keep email in sync
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

-- SECURITY DEFINER is required for auth.users trigger only.
-- Lock down execute: only the trigger owner path should invoke it.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger diagnostic_sessions_updated_at
  before update on public.diagnostic_sessions
  for each row execute function public.set_updated_at();

create trigger diagnostic_responses_updated_at
  before update on public.diagnostic_responses
  for each row execute function public.set_updated_at();

-- When an org is created, add creator as owner
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.org_members (org_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

revoke all on function public.handle_new_organization() from public;
revoke all on function public.handle_new_organization() from anon, authenticated;

create trigger on_organization_created
  after insert on public.organizations
  for each row execute function public.handle_new_organization();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.diagnostic_sessions enable row level security;
alter table public.diagnostic_responses enable row level security;

-- Profiles
create policy "Users can select own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Organizations
create policy "Members can select their orgs"
  on public.organizations for select
  to authenticated
  using ( public.is_org_member(id) );

create policy "Authenticated users can create orgs"
  on public.organizations for insert
  to authenticated
  with check ( (select auth.uid()) = created_by );

create policy "Org admins can update orgs"
  on public.organizations for update
  to authenticated
  using ( public.is_org_admin(id) )
  with check ( public.is_org_admin(id) );

create policy "Org owners can delete orgs"
  on public.organizations for delete
  to authenticated
  using (
    exists (
      select 1 from public.org_members m
      where m.org_id = id
        and m.user_id = (select auth.uid())
        and m.role = 'owner'
    )
  );

-- Org members
create policy "Members can select fellow members"
  on public.org_members for select
  to authenticated
  using ( public.is_org_member(org_id) );

create policy "Org admins can insert members"
  on public.org_members for insert
  to authenticated
  with check ( public.is_org_admin(org_id) );

create policy "Org admins can update members"
  on public.org_members for update
  to authenticated
  using ( public.is_org_admin(org_id) )
  with check ( public.is_org_admin(org_id) );

create policy "Org admins can delete members"
  on public.org_members for delete
  to authenticated
  using ( public.is_org_admin(org_id) );

-- Diagnostic sessions
create policy "Members can select sessions"
  on public.diagnostic_sessions for select
  to authenticated
  using ( public.is_org_member(org_id) );

create policy "Org admins can insert sessions"
  on public.diagnostic_sessions for insert
  to authenticated
  with check (
    public.is_org_admin(org_id)
    and (select auth.uid()) = created_by
  );

create policy "Org admins can update sessions"
  on public.diagnostic_sessions for update
  to authenticated
  using ( public.is_org_admin(org_id) )
  with check ( public.is_org_admin(org_id) );

create policy "Org admins can delete sessions"
  on public.diagnostic_sessions for delete
  to authenticated
  using ( public.is_org_admin(org_id) );

-- Diagnostic responses
create policy "Members can select responses in their org sessions"
  on public.diagnostic_responses for select
  to authenticated
  using (
    exists (
      select 1
      from public.diagnostic_sessions s
      where s.id = session_id
        and public.is_org_member(s.org_id)
    )
  );

create policy "Authenticated users can insert own responses"
  on public.diagnostic_responses for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.diagnostic_sessions s
      where s.id = session_id
        and s.status = 'active'
        and public.is_org_member(s.org_id)
    )
  );

create policy "Users can update own responses"
  on public.diagnostic_responses for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Users can delete own responses"
  on public.diagnostic_responses for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- ---------------------------------------------------------------------------
-- Explicit Data API grants (new projects may not auto-expose tables)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.organizations to authenticated;
grant select, insert, update, delete on table public.org_members to authenticated;
grant select, insert, update, delete on table public.diagnostic_sessions to authenticated;
grant select, insert, update, delete on table public.diagnostic_responses to authenticated;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
