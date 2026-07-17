"use client";

import { useEffect, useRef } from "react";
import type { FrictionFactorId } from "@/types/diagnosis";
import type { OrgActionCard } from "@/types/report";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionCardsProps {
  items: OrgActionCard[];
  selectedFrictionId?: FrictionFactorId | null;
  onSelectFriction?: (id: FrictionFactorId) => void;
  scrollRequestId?: number;
}

function ActionCardItem({
  card,
  highlighted,
  onFrictionClick,
  cardRef,
}: {
  card: OrgActionCard;
  highlighted: boolean;
  onFrictionClick?: (id: FrictionFactorId) => void;
  cardRef?: (el: HTMLElement | null) => void;
}) {
  const isP1 = card.priority === "P1";

  return (
    <article
      ref={cardRef}
      id={`action-card-${card.id}`}
      data-friction={card.frictionId}
      className={cn(
        "min-w-0 rounded-xl border border-border/80 bg-white p-3.5 shadow-none transition-shadow sm:p-5",
        "hover:shadow-md",
        highlighted &&
          "border-blue-400 bg-blue-50/40 shadow-md ring-2 ring-blue-200",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge
          className={cn(
            "h-5 shrink-0 border-0 px-2 text-[11px] font-semibold",
            isP1
              ? "bg-blue-700 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-700 hover:bg-slate-200",
          )}
        >
          {card.priority}
        </Badge>
        <button
          type="button"
          onClick={() => onFrictionClick?.(card.frictionId)}
          className="min-w-0 max-w-full text-left text-xs font-medium break-keep text-blue-700 underline-offset-2 hover:underline sm:text-[13px]"
          title="Friction Map에서 강조"
        >
          {card.frictionLabel}
        </button>
      </div>

      <h3 className="mt-2.5 text-[15px] font-semibold leading-snug break-keep text-foreground sm:text-[17px]">
        {card.title}
      </h3>

      <dl className="mt-3 min-w-0 space-y-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">
            왜 지금인가
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed break-keep text-foreground/90 sm:text-sm">
            {card.whyNow}
          </dd>
        </div>

        {/* Mobile: 2-col grid so labels/values don't wrap mid-word awkwardly */}
        <div className="grid min-w-0 grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1 sm:text-sm">
          <div className="min-w-0">
            <p className="font-medium text-muted-foreground">누가</p>
            <p className="mt-0.5 break-keep text-foreground/90">{card.who}</p>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-muted-foreground">언제까지</p>
            <p className="mt-0.5 break-keep text-foreground/90">
              {card.byWhen}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">
            성공 지표
          </dt>
          <dd className="mt-1">
            {/* list-outside avoids mid-line wrap under bullet on narrow screens */}
            <ul className="list-outside list-disc space-y-1.5 pl-4 text-xs leading-relaxed break-keep text-foreground/90 sm:text-sm">
              {card.successMetrics.map((m) => (
                <li key={m} className="pl-0.5 marker:text-muted-foreground">
                  {m}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      {/* Next action — full width, comfortable pad on phone */}
      <div className="mt-3.5 rounded-lg border-l-4 border-blue-600 bg-blue-50/80 px-3 py-2.5 sm:mt-4">
        <p className="text-[11px] font-semibold tracking-wide text-blue-800">
          다음 액션
        </p>
        <p className="mt-1 text-xs leading-relaxed break-keep text-blue-950/90 sm:text-sm">
          {card.nextAction}
        </p>
      </div>
    </article>
  );
}

function Column({
  title,
  subtitle,
  cards,
  selectedFrictionId,
  onSelectFriction,
  registerRef,
}: {
  title: string;
  subtitle: string;
  cards: OrgActionCard[];
  selectedFrictionId?: FrictionFactorId | null;
  onSelectFriction?: (id: FrictionFactorId) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-3.5">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-sm">
          {subtitle}
        </p>
      </div>
      {/* Extra air between cards on mobile so sections don't feel cramped */}
      <div className="space-y-3.5 sm:space-y-3">
        {cards.map((card) => (
          <ActionCardItem
            key={card.id}
            card={card}
            highlighted={selectedFrictionId === card.frictionId}
            onFrictionClick={onSelectFriction}
            cardRef={(el) => registerRef(card.id, el)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * HR dashboard action cards:
 * Desktop — HR (left) | Executive requests (right)
 * Mobile — single column, HR then executive, roomy gaps
 */
export function ActionCards({
  items,
  selectedFrictionId = null,
  onSelectFriction,
  scrollRequestId = 0,
}: ActionCardsProps) {
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const hrCards = items.filter((c) => c.audience === "hr");
  const execCards = items.filter((c) => c.audience === "executive");

  useEffect(() => {
    if (!scrollRequestId || !selectedFrictionId) return;
    const match = items.find((c) => c.frictionId === selectedFrictionId);
    if (!match) return;
    const t = window.setTimeout(() => {
      const el = refs.current.get(match.id);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [scrollRequestId, selectedFrictionId, items]);

  function registerRef(id: string, el: HTMLElement | null) {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  }

  if (items.length === 0) return null;

  return (
    <section
      id="action-cards"
      className="min-w-0 space-y-4 sm:space-y-5"
      aria-label="액션 카드"
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold sm:text-xl">액션 카드</h2>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-sm">
          이번 주~30일 할 일 · Friction Map 상위 요인을 실행 과제로 나눕니다.
          라벨을 누르면 Map과 연결됩니다.
        </p>
      </div>

      {/* Mobile 1-col with generous gap between HR / exec blocks */}
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:gap-5">
        <Column
          title="HR이 할 일"
          subtitle="진단 후 HR이 바로 착수할 실행 과제"
          cards={hrCards}
          selectedFrictionId={selectedFrictionId}
          onSelectFriction={onSelectFriction}
          registerRef={registerRef}
        />
        <Column
          title="경영진에 요청할 일"
          subtitle="승인·메시지·우선순위 합의가 필요한 항목"
          cards={execCards}
          selectedFrictionId={selectedFrictionId}
          onSelectFriction={onSelectFriction}
          registerRef={registerRef}
        />
      </div>
    </section>
  );
}
