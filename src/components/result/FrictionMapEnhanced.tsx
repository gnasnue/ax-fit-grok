"use client";

import { useMemo, useState } from "react";
import type { FrictionFactorId } from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type { GapInsight, RolePerceptionGap } from "@/types/report";
import { frictionSeverity } from "@/lib/scoring/severity";
import { ROLE_PERCEPTION_INSUFFICIENT } from "@/lib/scoring/role-perception";
import { getFrictionProblemLine } from "@/lib/templates/executive-report";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const FOOTER_NOTE =
  "점수는 레이어 가중치(팀장 1.3 / 실무자 1.2 / 경영진 0.75)와 갭 가점이 반영된 값입니다. 70점 이상은 구조적 개입이 필요한 수준으로 해석합니다.";

const LAYER_ORDER = [
  { key: "executive" as const, label: "경영진" },
  { key: "manager" as const, label: "팀장" },
  { key: "staff" as const, label: "실무자" },
];

interface FrictionMapEnhancedProps {
  /**
   * Optional — when omitted, diagnosis line is expected in the page header
   * (avoids duplicate one-liner on org result).
   */
  oneLiner?: string | null;
  factors: FrictionScore[];
  gapInsights: GapInsight[];
  rolePerceptionGaps: RolePerceptionGap[];
  selectedFrictionId?: FrictionFactorId | null;
  onSelectFriction?: (id: FrictionFactorId | null) => void;
  onNavigateToActions?: (id: FrictionFactorId) => void;
}

/** Bold 「factor」 segments in diagnosis one-liner */
function DiagnosisLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/(「[^」]+」)/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.startsWith("「") && part.endsWith("」") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function FactorDetail({
  factor,
  gapInsights,
  onNavigateToActions,
}: {
  factor: FrictionScore;
  gapInsights: GapInsight[];
  onNavigateToActions?: (id: FrictionFactorId) => void;
}) {
  const problem = getFrictionProblemLine(factor.id, factor.score);
  const relatedGaps = gapInsights.filter((g) =>
    g.factors.includes(factor.id),
  );
  const severity = frictionSeverity(factor.score);

  return (
    <div className="min-w-0 space-y-3 text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="min-w-0 font-semibold break-keep text-foreground">
          {factor.name}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "h-auto max-w-full border px-1.5 py-0.5 text-[11px] leading-snug whitespace-normal",
            severity.badgeClass,
          )}
        >
          {severity.label}
        </Badge>
        <span className="tabular-nums text-muted-foreground">
          {factor.score}점
        </span>
      </div>
      <p className="leading-relaxed break-keep text-foreground/90">{problem}</p>
      {relatedGaps.length > 0 ? (
        <ul className="space-y-1.5 border-t pt-2">
          <li className="text-xs font-medium text-muted-foreground">
            관련 갭 신호
          </li>
          {relatedGaps.map((g) => (
            <li
              key={g.id}
              className="text-xs leading-relaxed break-keep text-muted-foreground"
            >
              · {g.problemLine}
            </li>
          ))}
        </ul>
      ) : null}
      {onNavigateToActions ? (
        <button
          type="button"
          onClick={() => onNavigateToActions(factor.id)}
          className="min-h-11 w-full rounded-lg bg-blue-50 px-3 py-2.5 text-left text-sm font-medium text-blue-700 sm:min-h-0 sm:w-auto sm:bg-transparent sm:px-0 sm:py-0 sm:underline-offset-2 sm:hover:underline"
        >
          연결 액션 보기 →
        </button>
      ) : null}
    </div>
  );
}

/**
 * Enhanced Friction Map — mobile-first (≈375px): no name truncation,
 * bar+score scannable, bottom-sheet detail scrollable.
 */
export function FrictionMapEnhanced({
  oneLiner = null,
  factors,
  gapInsights,
  rolePerceptionGaps,
  selectedFrictionId = null,
  onSelectFriction,
  onNavigateToActions,
}: FrictionMapEnhancedProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailId, setDetailId] = useState<FrictionFactorId | null>(null);

  const sorted = useMemo(
    () => [...factors].sort((a, b) => b.score - a.score),
    [factors],
  );

  const detailFactor =
    sorted.find((f) => f.id === detailId) ??
    sorted.find((f) => f.id === selectedFrictionId) ??
    null;

  function handleSelect(id: FrictionFactorId) {
    const next = selectedFrictionId === id ? null : id;
    onSelectFriction?.(next);
    setDetailId(next);
    if (isMobile && next) setSheetOpen(true);
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="space-y-2.5 px-3 pt-4 sm:space-y-3 sm:px-6 sm:pt-6">
        <div>
          <CardTitle className="text-base sm:text-lg">
            Friction Map{" "}
            <span className="font-normal text-muted-foreground">
              · 구조 장벽 지도
            </span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            구조적 장벽 점수 (0–100). 높을수록 재설계 우선순위가 높습니다.
          </CardDescription>
        </div>
        {/* Optional one-liner — page header is preferred on org result */}
        {oneLiner ? (
          <DiagnosisLine
            text={oneLiner}
            className="text-sm font-medium leading-relaxed break-keep text-foreground sm:text-base sm:leading-relaxed md:text-lg"
          />
        ) : null}
      </CardHeader>

      <CardContent className="space-y-5 px-3 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
        {/* 2) Main horizontal bars */}
        <div className="space-y-2" role="list" aria-label="마찰 요인 점수">
          {sorted.map((f, rank) => {
            const severity = frictionSeverity(f.score);
            const isTop = rank < 2;
            const isSelected = selectedFrictionId === f.id;
            const isDetailOpen = !isMobile && detailId === f.id;

            return (
              <div key={f.id} className="min-w-0" role="listitem">
                <button
                  type="button"
                  onClick={() => handleSelect(f.id)}
                  className={cn(
                    "group w-full min-w-0 rounded-xl border px-2.5 py-2.5 text-left transition-all sm:px-3.5 sm:py-3",
                    "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isTop && "border-foreground/20 shadow-sm",
                    isSelected &&
                      "border-blue-400 bg-blue-50/60 ring-2 ring-blue-200",
                    !isTop && !isSelected && "border-border/80 bg-card",
                  )}
                  aria-pressed={isSelected}
                  aria-expanded={
                    isDetailOpen ||
                    (isMobile && sheetOpen && detailId === f.id)
                  }
                >
                  {/*
                    Mobile (default): stack — name full width (no truncate),
                    then bar+score on one row, severity badge below.
                    sm+: name | bar | score+badge columns.
                  */}
                  <div className="min-w-0 space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-[minmax(7.5rem,9.5rem)_1fr_auto] sm:items-center sm:gap-3">
                    {/* Name + 최우선 — never truncate */}
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="min-w-0 text-[13px] font-medium leading-snug break-keep text-foreground sm:text-sm">
                        {f.name}
                      </span>
                      {isTop ? (
                        <Badge className="h-5 shrink-0 border-0 bg-blue-700 px-1.5 text-[10px] text-white hover:bg-blue-700">
                          최우선
                        </Badge>
                      ) : null}
                    </div>

                    {/* Bar + score (mobile: same row for quick scan) */}
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted sm:h-3.5"
                        style={
                          isTop
                            ? {
                                boxShadow: `0 0 0 1px ${severity.barColor}40`,
                              }
                            : undefined
                        }
                        role="progressbar"
                        aria-valuenow={f.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${f.name} ${f.score}점`}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, f.score))}%`,
                            backgroundColor: severity.barColor,
                          }}
                        />
                      </div>
                      {/* Score always visible next to bar on mobile */}
                      <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground sm:hidden">
                        {f.score}
                      </span>
                    </div>

                    {/* Desktop score + badge; mobile: badge only (score already by bar) */}
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end">
                      <span className="hidden text-sm font-semibold tabular-nums text-foreground sm:inline">
                        {f.score}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-auto max-w-full border px-1.5 py-0.5 text-[10px] leading-snug whitespace-normal sm:text-[11px]",
                          severity.badgeClass,
                        )}
                      >
                        {severity.label}
                      </Badge>
                    </div>
                  </div>
                </button>

                {isDetailOpen && detailFactor ? (
                  <div className="mt-1 rounded-xl border border-dashed bg-muted/30 px-3 py-3 sm:px-4">
                    <FactorDetail
                      factor={detailFactor}
                      gapInsights={gapInsights}
                      onNavigateToActions={onNavigateToActions}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 3) Role perception */}
        <section className="min-w-0 space-y-2.5 rounded-xl border bg-muted/20 px-2.5 py-3 sm:space-y-3 sm:px-4 sm:py-4">
          <h3 className="text-sm font-semibold text-foreground">
            역할별 인식 차이
          </h3>
          {rolePerceptionGaps.length === 0 ? (
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {ROLE_PERCEPTION_INSUFFICIENT}
            </p>
          ) : (
            <ul className="space-y-3">
              {rolePerceptionGaps.map((gap) => (
                <li key={gap.id} className="min-w-0 space-y-2">
                  <p className="text-xs leading-relaxed break-keep text-foreground/90 sm:text-sm">
                    {gap.statement}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {LAYER_ORDER.map(({ key, label }) => {
                      const score = gap.layerScores[key];
                      if (score === null) {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-[11px] text-muted-foreground"
                          >
                            <span className="w-10 shrink-0">{label}</span>
                            <span className="text-muted-foreground/70">—</span>
                          </div>
                        );
                      }
                      const sev = frictionSeverity(score);
                      return (
                        <div
                          key={key}
                          className="flex min-w-0 items-center gap-2 text-[11px]"
                        >
                          <span className="w-10 shrink-0 text-muted-foreground">
                            {label}
                          </span>
                          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, score)}%`,
                                backgroundColor: sev.barColor,
                              }}
                            />
                          </div>
                          <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
                            {score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          {FOOTER_NOTE}
        </p>
      </CardContent>

      {/* Mobile bottom sheet — header fixed, body scrolls, safe bottom pad */}
      <Sheet
        open={sheetOpen && isMobile}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setDetailId(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="flex max-h-[min(85dvh,85vh)] flex-col gap-0 overflow-hidden p-0"
        >
          <SheetHeader className="shrink-0 border-b px-4 pr-12 pt-4 pb-3">
            <SheetTitle>요인 상세</SheetTitle>
            <SheetDescription>
              진단 근거와 연결 액션으로 이동합니다.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {detailFactor ? (
              <FactorDetail
                factor={detailFactor}
                gapInsights={gapInsights}
                onNavigateToActions={(id) => {
                  setSheetOpen(false);
                  onNavigateToActions?.(id);
                }}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
