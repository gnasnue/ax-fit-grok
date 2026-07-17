/** Diagnosis funnel steps (pre-result) */

export type FunnelStepId = "context" | "role" | "respondent" | "diagnose";

export interface FunnelStep {
  id: FunnelStepId;
  /** Full label (desktop) */
  label: string;
  /** Compact label (mobile) */
  shortLabel: string;
  href: string;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  {
    id: "context",
    label: "회사 맥락",
    shortLabel: "맥락",
    href: "/context",
  },
  {
    id: "role",
    label: "역할",
    shortLabel: "역할",
    href: "/role",
  },
  {
    id: "respondent",
    label: "응답자 정보",
    shortLabel: "응답자",
    href: "/respondent",
  },
  {
    id: "diagnose",
    label: "진단",
    shortLabel: "진단",
    href: "/diagnose",
  },
];

export function funnelStepIndex(id: FunnelStepId): number {
  return FUNNEL_STEPS.findIndex((s) => s.id === id);
}

/** Rough minutes for role questionnaire (≈36s per item, min 5) */
export function estimateDiagnoseMinutes(questionCount: number): number {
  if (questionCount <= 0) return 5;
  return Math.max(5, Math.ceil(questionCount * 0.6));
}
