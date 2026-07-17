"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MoreSectionsProps {
  /** Label when collapsed */
  collapsedLabel?: string;
  /** Label when expanded */
  expandedLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Progressive disclosure for org-result secondary blocks
 * (분기 파일럿, HR 가이드, 전체 리포트 미리보기 등).
 */
export function MoreSections({
  collapsedLabel = "더 보기 · 분기 파일럿 · HR 가이드 · 리포트 전문",
  expandedLabel = "접기",
  children,
  className,
}: MoreSectionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("min-w-0 space-y-4", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "border-border bg-muted/30" : "border-primary/30 bg-primary/5 text-primary",
        )}
      >
        <span className="text-center leading-snug">
          {open ? expandedLabel : collapsedLabel}
        </span>
        <span className="shrink-0 text-xs opacity-70" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <div className="min-w-0 space-y-6 sm:space-y-8 animate-in fade-in-0 duration-200">
          {children}
        </div>
      ) : null}
    </div>
  );
}
