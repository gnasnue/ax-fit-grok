/**
 * Friction Map severity bands (HR dashboard visualization).
 * Note: intensityBand in executive-report uses 65 for copy bands — keep separate.
 */

export type FrictionSeverityLevel = "critical" | "watch" | "ok";

export interface FrictionSeverity {
  level: FrictionSeverityLevel;
  /** Badge label */
  label: string;
  /** Bar fill color */
  barColor: string;
  /** Tailwind-ish badge text class hints (used by UI) */
  badgeClass: string;
}

/** Spec: ≥70 structural, 40–69 watch, ≤39 ok */
export function frictionSeverity(score: number): FrictionSeverity {
  if (score >= 70) {
    return {
      level: "critical",
      label: "구조적 개입 필요",
      barColor: "#EF4444",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
    };
  }
  if (score >= 40) {
    return {
      level: "watch",
      label: "주의 관찰",
      barColor: "#F59E0B",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    level: "ok",
    label: "양호",
    barColor: "#94A3B8",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
  };
}
