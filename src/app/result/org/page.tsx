"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ActionCards } from "@/components/result/ActionCards";
import { DemoBanner } from "@/components/result/DemoBanner";
import { ExecutiveReportView } from "@/components/result/ExecutiveReport";
import { FrictionMapEnhanced } from "@/components/result/FrictionMapEnhanced";
import { GapInsightsPanel } from "@/components/result/GapInsights";
import { HrGuidePanel } from "@/components/result/HrGuidePanel";
import { MoreSections } from "@/components/result/MoreSections";
import { PriorityCards } from "@/components/result/PriorityCards";
import { PageShell } from "@/components/layout/PageShell";
import { downloadExecutivePdf } from "@/components/report/ReportPDF";
import { buttonVariants } from "@/components/ui/button";
import { INDUSTRY_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import {
  CONTINUE_ROLE_CTA,
  CONTINUE_ROLE_HINT,
} from "@/lib/templates/layer-notices";
import { useDiagnosisStore } from "@/stores/diagnosis";
import type { FrictionFactorId } from "@/types/diagnosis";
import { cn } from "@/lib/utils";

/** Org result — meeting-default view + progressive disclosure */
export default function OrgResultPage() {
  const result = useDiagnosisStore((s) => s.result);
  const context = useDiagnosisStore((s) => s.context);
  const demoMeta = useDiagnosisStore((s) => s.demoMeta);
  const isDemo = useDiagnosisStore((s) => s.isDemoSession);

  const [selectedFrictionId, setSelectedFrictionId] =
    useState<FrictionFactorId | null>(null);
  const [scrollRequestId, setScrollRequestId] = useState(0);

  const handleSelectFriction = useCallback((id: FrictionFactorId | null) => {
    setSelectedFrictionId(id);
  }, []);

  const handleNavigateToActions = useCallback((id: FrictionFactorId) => {
    setSelectedFrictionId(id);
    setScrollRequestId((t) => t + 1);
  }, []);

  const handleActionFrictionClick = useCallback((id: FrictionFactorId) => {
    setSelectedFrictionId(id);
    requestAnimationFrame(() => {
      document
        .getElementById("friction-map")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  if (!result) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">조직 결과가 없습니다.</p>
        <Link
          href="/demo"
          className={cn(
            buttonVariants(),
            "mt-4 inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          데모 결과 보기
        </Link>
      </PageShell>
    );
  }

  const { org } = result;
  const layerCount = org.layerCount ?? 1;
  const isSingleLayer = layerCount <= 1;

  const pdfLabel = (() => {
    const industry =
      INDUSTRY_OPTIONS.find((o) => o.value === context.industry)?.label ?? "";
    const size =
      SIZE_OPTIONS.find((o) => o.value === context.size)?.label ?? "";
    return (
      demoMeta?.companyLabel ||
      [industry, size].filter(Boolean).join(" · ") ||
      undefined
    );
  })();

  function handleDownloadPdf() {
    void downloadExecutivePdf(
      org.executiveReport,
      "ax-fit-executive-report.pdf",
      pdfLabel,
    );
  }

  return (
    <PageShell width="2xl" className="space-y-6 sm:space-y-8 md:space-y-10">
      <DemoBanner variant="org" />

      {/* ── 1) 한 줄 진단 (유일한 위치) ───────────────────────── */}
      <header className="min-w-0 space-y-2 sm:space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            조직 결과
          </p>
          {isSingleLayer ? (
            <span className="rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              1개 레이어 기준
            </span>
          ) : (
            <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {layerCount}개 레이어 반영
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
          한 줄 진단
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed break-keep text-foreground sm:text-base md:text-lg">
          {org.oneLiner}
        </p>
        {org.layerDisclaimer ? (
          <p className="max-w-3xl rounded-lg border border-dashed border-amber-300/70 bg-amber-50/50 px-3 py-2 text-xs leading-relaxed text-amber-950/90 sm:text-sm dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100/90">
            {org.layerDisclaimer}
          </p>
        ) : null}
      </header>

      {/* Gap — kept near diagnosis; soft copy when single layer */}
      <GapInsightsPanel
        items={org.gapInsights}
        singleLayer={isSingleLayer}
      />

      {/* ── 2) Friction Map (no duplicate one-liner) ──────────── */}
      <div id="friction-map">
        <FrictionMapEnhanced
          factors={org.frictionMap}
          gapInsights={org.gapInsights ?? []}
          rolePerceptionGaps={org.rolePerceptionGaps ?? []}
          selectedFrictionId={selectedFrictionId}
          onSelectFriction={handleSelectFriction}
          onNavigateToActions={handleNavigateToActions}
        />
      </div>

      {/* ── 3) 액션 카드 = 이번 주~30일 ──────────────────────── */}
      <ActionCards
        items={org.actionCards ?? []}
        selectedFrictionId={selectedFrictionId}
        onSelectFriction={handleActionFrictionClick}
        scrollRequestId={scrollRequestId}
      />

      {/* ── 4) PDF 다운로드 (항상 노출) ───────────────────────── */}
      <section
        className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        aria-label="경영진 리포트 PDF"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">
            경영진용 한 장 리포트
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            회의 자료 PDF · 한 줄 진단·구조 문제·30일 액션 요약
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className={cn(
            buttonVariants(),
            "h-11 w-full shrink-0 sm:h-9 sm:w-auto",
          )}
        >
          PDF 다운로드
        </button>
      </section>

      {/* ── 더 보기: 분기 파일럿 · HR 가이드 · 리포트 전문 ───── */}
      <MoreSections>
        <PriorityCards items={org.priorities} />
        <HrGuidePanel guide={org.hrGuide} />
        <ExecutiveReportView
          report={org.executiveReport}
          onDownloadPdf={handleDownloadPdf}
        />
      </MoreSections>

      {/* Continue another role (real flow only) */}
      {!isDemo ? (
        <div className="rounded-xl border border-dashed px-3 py-3 sm:px-4">
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {CONTINUE_ROLE_HINT}
            {isSingleLayer
              ? " 지금 결과는 1개 레이어 기준 참고 신호입니다."
              : ""}
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

      <div className="flex flex-col-reverse gap-2 pb-4 sm:flex-row sm:justify-center sm:gap-3 sm:pb-8">
        <Link
          href="/result/personal"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          개인 결과
        </Link>
        <Link
          href="/"
          className={cn(
            buttonVariants(),
            "inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          처음으로
        </Link>
      </div>
    </PageShell>
  );
}
