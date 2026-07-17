"use client";

import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/constants";
import { ROLE_PAGE_NOTICES } from "@/lib/templates/layer-notices";
import { useDiagnosisStore } from "@/stores/diagnosis";
import type { RoleLayer } from "@/types/diagnosis";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ROLES: RoleLayer[] = ["executive", "manager", "staff"];

const HINTS: Record<RoleLayer, string> = {
  executive: "목표·성과·조직 우선순위를 결정하는 임원",
  manager: "팀을 이끌며 현장과 경영진 사이에 있는 팀장",
  staff: "일상 업무에서 AI/도구를 직접 쓰는 실무자",
};

export default function RolePage() {
  const router = useRouter();
  const { role, setRole, context } = useDiagnosisStore();

  if (!context.industry) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">회사 맥락을 먼저 입력해 주세요.</p>
        <Button className="mt-4 h-11 w-full sm:h-9 sm:w-auto" onClick={() => router.push("/context")}>
          맥락 입력으로
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell width="md">
      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl">
            어떤 역할로 진단에 참여하시나요?
          </CardTitle>
          <CardDescription>
            역할에 맞는 문항이 제시됩니다. (8~10문항)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2.5 px-4 pb-5 sm:gap-3 sm:px-6 sm:pb-6">
          <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {ROLE_PAGE_NOTICES.map((line, i) => (
              <p key={line} className={i > 0 ? "mt-1" : undefined}>
                {line}
              </p>
            ))}
          </div>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "min-h-[4.5rem] rounded-xl border p-3.5 text-left transition-colors sm:p-4",
                "active:bg-muted/50",
                role === r
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/40",
              )}
            >
              <p className="font-semibold text-sm sm:text-base">
                {ROLE_LABELS[r]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {HINTS[r]}
              </p>
            </button>
          ))}
          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-between sm:pt-4">
            <Button
              variant="outline"
              className="h-11 w-full sm:h-9 sm:w-auto"
              onClick={() => router.push("/context")}
            >
              이전
            </Button>
            <Button
              className="h-11 w-full sm:h-9 sm:w-auto"
              disabled={!role}
              onClick={() => router.push("/respondent")}
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
