import { cn } from "@/lib/utils";

const TOTAL_LAYERS = 3;

interface LayerCountBadgeProps {
  /** Collected role layers (1–3) */
  layerCount: number;
  className?: string;
}

/**
 * Real diagnosis: “수집 레이어 1/3”.
 * Demo (3/3) can still use this for consistency when not demo-only copy.
 */
export function LayerCountBadge({
  layerCount,
  className,
}: LayerCountBadgeProps) {
  const n = Math.min(TOTAL_LAYERS, Math.max(0, layerCount));
  const single = n <= 1;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums",
        single
          ? "border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      수집 레이어 {n}/{TOTAL_LAYERS}
    </span>
  );
}
