"use client";

import { cn } from "@/lib/utils";

interface ScaleInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export function ScaleInput({
  value,
  onChange,
  min = 1,
  max = 5,
  lowLabel = "전혀 아니다",
  highLabel = "매우 그렇다",
}: ScaleInputProps) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-3">
      {/* Mobile: equal-width row; desktop: centered circles */}
      <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-2">
        {points.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex aspect-square min-h-11 w-full items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:h-12 sm:w-12 sm:text-base",
              "touch-manipulation active:scale-95",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50",
            )}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
        <span className="max-w-[45%] text-left">{lowLabel}</span>
        <span className="max-w-[45%] text-right">{highLabel}</span>
      </div>
    </div>
  );
}
