import type { FrictionFactorId, RoleLayer } from "./diagnosis";
import type { FrictionScore } from "./friction";

export interface MetricDefinition {
  did: string;
  result: string;
  howToTrack: string;
}

export interface ActionItem {
  id: string;
  title: string;
  who: string;
  what: string;
  byWhen: string;
  deliverable: string;
  metrics: MetricDefinition;
}

export interface PriorityCard {
  id: string;
  frictionId: FrictionFactorId;
  title: string;
  rationale: string;
  pilotForm: string;
  roles: {
    hr: string;
    manager: string;
    it: string;
  };
  successMetric: string;
  score: number;
}

export interface PersonalResult {
  role: RoleLayer;
  summary: string;
  topFrictions: FrictionScore[];
  microActions: ActionItem[];
}

export interface ExecutiveReport {
  headline: string;
  structuralProblems: string[];
  recommendation: string;
  roleSplit: {
    executive: string;
    hr: string;
    it: string;
    business: string;
  };
  next30Days: ActionItem[];
}

export interface HrGuide {
  messageToExec: string;
  discussionOrder: string[];
  pilotSuggestion: string;
}

/** Explicit employee–org gap insight for org results */
export interface GapInsight {
  id: string;
  /** Short area label, e.g. 추진 속도 간극 */
  area: string;
  factors: FrictionFactorId[];
  /** 0–100 severity for ranking */
  severity: number;
  /** Board-ready problem sentence */
  problemLine: string;
}

/** Layer-vs-layer perception gap for Friction Map mini comparison */
export interface RolePerceptionGap {
  id: string;
  /** Related friction factor for highlight linking */
  frictionId: FrictionFactorId;
  /** Short board-ready comparison sentence */
  statement: string;
  /** Per-layer friction means 0–100 (null = no data for layer) */
  layerScores: {
    executive: number | null;
    manager: number | null;
    staff: number | null;
  };
}

export type ActionAudience = "hr" | "executive";

/**
 * HR dashboard action card — derived from scoring + templates.
 * Never hardcode copy on result pages.
 */
export interface OrgActionCard {
  id: string;
  priority: "P1" | "P2";
  audience: ActionAudience;
  frictionId: FrictionFactorId;
  /** e.g. "F1 · 평가·보상 불일치" */
  frictionLabel: string;
  title: string;
  /** One-line diagnostic rationale */
  whyNow: string;
  who: string;
  byWhen: string;
  successMetrics: string[];
  /** Immediate first step the owner can take today */
  nextAction: string;
}

export interface OrgResult {
  oneLiner: string;
  frictionMap: FrictionScore[];
  priorities: PriorityCard[];
  /** HR + executive action cards for dashboard columns */
  actionCards: OrgActionCard[];
  /** Role-layer perception differences for Friction Map */
  rolePerceptionGaps: RolePerceptionGap[];
  executiveReport: ExecutiveReport;
  hrGuide: HrGuide;
  /** TOP gap areas (typically 2) — empty if no strong gap signal */
  gapInsights: GapInsight[];
  /** Number of role layers that contributed answers (1–3) */
  layerCount: number;
  /**
   * Present when only one role layer has responses.
   * Null when 2+ layers contributed (fuller org picture).
   */
  layerDisclaimer: string | null;
}

export interface CalculationResult {
  personal: PersonalResult;
  org: OrgResult;
}
