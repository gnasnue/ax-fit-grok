"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DemoBanner } from "@/components/result/DemoBanner";
import { LayerCountBadge } from "@/components/result/LayerCountBadge";
import { PersonalSummary } from "@/components/result/PersonalSummary";
import { buttonVariants } from "@/components/ui/button";
import {
  CONTINUE_ROLE_CTA,
  CONTINUE_ROLE_HINT,
  PERSONAL_ORG_CTA_HINT,
  PERSONAL_SINGLE_LAYER_BADGE,
} from "@/lib/templates/layer-notices";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { cn } from "@/lib/utils";

export default function PersonalResultPage() {
  const router = useRouter();
  const result = useDiagnosisStore((s) => s.result);
  const isDemo = useDiagnosisStore((s) => s.isDemoSession);

  if (!result) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">진단 결과가 없습니다.</p>
        <Link
          href="/context"
          className={cn(
            buttonVariants(),
            "mt-4 inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          진단 시작
        </Link>
      </PageShell>
    );
  }

  const layerCount = result.org.layerCount ?? 1;
  const isSingleLayer = layerCount <= 1;

  return (
    <PageShell width="md" className="space-y-6 sm:space-y-8">
      <DemoBanner variant="personal" />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            개인 결과
          </h1>
          {!isDemo ? <LayerCountBadge layerCount={layerCount} /> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {isDemo
            ? "데모 참여자(중간관리자) 응답 기준 요약입니다. 이어서 조직 전체 결과를 확인하세요."
            : "나의 응답 기준 요약입니다. 조직 결과는 레이어·맥락을 반영합니다."}
        </p>
        {isSingleLayer && !isDemo ? (
          <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-950/90 sm:text-sm dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100/90">
            {PERSONAL_SINGLE_LAYER_BADGE}
          </p>
        ) : null}
      </div>

      <PersonalSummary result={result.personal} />

      <div className="space-y-3">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {!isDemo ? (
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full sm:h-9 sm:w-auto",
              )}
              onClick={() => router.push("/diagnose")}
            >
              응답 다시 보기
            </button>
          ) : null}
          <Link
            href="/result/org"
            className={cn(
              buttonVariants(),
              "inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
            )}
          >
            조직 Friction Map 보기
          </Link>
        </div>
        {isSingleLayer && !isDemo ? (
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            {PERSONAL_ORG_CTA_HINT}
          </p>
        ) : null}

        {!isDemo ? (
          <div className="rounded-xl border border-dashed px-3 py-3 sm:px-4">
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {CONTINUE_ROLE_HINT}
            </p>
            <Link
              href="/role"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-2 inline-flex h-10 w-full justify-center sm:h-9 sm:w-auto",
              )}
            >
              {CONTINUE_ROLE_CTA}
            </Link>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
