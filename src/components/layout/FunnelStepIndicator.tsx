"use client";

import { FUNNEL_STEPS, type FunnelStepId, funnelStepIndex } from "@/lib/funnel";
import { cn } from "@/lib/utils";

interface FunnelStepIndicatorProps {
  current: FunnelStepId;
  className?: string;
}

/**
 * 1 회사 맥락 → 2 역할 → 3 응답자 정보 → 4 진단
 * Mobile: compact short labels; desktop: full labels.
 */
export function FunnelStepIndicator({
  current,
  className,
}: FunnelStepIndicatorProps) {
  const currentIdx = funnelStepIndex(current);

  return (
    <nav
      aria-label="진단 진행 단계"
      className={cn("min-w-0 w-full", className)}
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-y-2 sm:flex-nowrap">
        {FUNNEL_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const upcoming = i > currentIdx;

          return (
            <li
              key={step.id}
              className={cn(
                "flex min-w-0 items-center",
                i < FUNNEL_STEPS.length - 1 ? "flex-1 sm:flex-1" : "shrink-0",
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 items-center gap-1.5 sm:gap-2",
                  active && "text-foreground",
                  done && "text-foreground",
                  upcoming && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums sm:h-7 sm:w-7 sm:text-xs",
                    active &&
                      "bg-primary text-primary-foreground ring-2 ring-primary/20",
                    done && "bg-primary/15 text-primary",
                    upcoming && "bg-muted text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <span className="text-[10px] sm:text-xs" aria-hidden>
                      ✓
                    </span>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "min-w-0 truncate text-[11px] leading-tight sm:text-xs",
                    active && "font-semibold",
                    done && "font-medium",
                  )}
                >
                  <span className="sm:hidden">{step.shortLabel}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
              </div>

              {i < FUNNEL_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-1.5 h-px min-w-[0.5rem] flex-1 sm:mx-2",
                    done || active ? "bg-primary/40" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        4단계 중 {currentIdx + 1}단계:{" "}
        {FUNNEL_STEPS[currentIdx]?.label ?? current}
      </p>
    </nav>
  );
}
