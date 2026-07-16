"use client";

import Link from "next/link";
import { DemoBanner } from "@/components/result/DemoBanner";
import { ExecutiveReportView } from "@/components/result/ExecutiveReport";
import { FrictionMap } from "@/components/result/FrictionMap";
import { GapInsightsPanel } from "@/components/result/GapInsights";
import { HrGuidePanel } from "@/components/result/HrGuidePanel";
import { PriorityCards } from "@/components/result/PriorityCards";
import { PageShell } from "@/components/layout/PageShell";
import { downloadExecutivePdf } from "@/components/report/ReportPDF";
import { buttonVariants } from "@/components/ui/button";
import { INDUSTRY_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { cn } from "@/lib/utils";

/** Org result page — renders CalculationResult.org only (no hardcoded narratives) */
export default function OrgResultPage() {
  const result = useDiagnosisStore((s) => s.result);
  const context = useDiagnosisStore((s) => s.context);
  const demoMeta = useDiagnosisStore((s) => s.demoMeta);

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

  return (
    <PageShell width="2xl" className="space-y-6 sm:space-y-8 md:space-y-10">
      <DemoBanner variant="org" />

      <header className="min-w-0 space-y-2 sm:space-y-3">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          조직 결과
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
          한 줄 진단
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed break-keep text-muted-foreground sm:text-base md:text-lg">
          {org.oneLiner}
        </p>
        {org.layerDisclaimer ? (
          <p className="max-w-3xl rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
            {org.layerDisclaimer}
          </p>
        ) : null}
      </header>

      <GapInsightsPanel items={org.gapInsights} />
      <FrictionMap factors={org.frictionMap} />
      <PriorityCards items={org.priorities} />
      <ExecutiveReportView
        report={org.executiveReport}
        onDownloadPdf={() => {
          const industry =
            INDUSTRY_OPTIONS.find((o) => o.value === context.industry)?.label ??
            "";
          const size =
            SIZE_OPTIONS.find((o) => o.value === context.size)?.label ?? "";
          const label =
            demoMeta?.companyLabel ||
            [industry, size].filter(Boolean).join(" · ") ||
            undefined;
          void downloadExecutivePdf(
            org.executiveReport,
            "ax-fit-executive-report.pdf",
            label,
          );
        }}
      />
      <HrGuidePanel guide={org.hrGuide} />

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
