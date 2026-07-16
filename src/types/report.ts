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

export interface OrgResult {
  oneLiner: string;
  frictionMap: FrictionScore[];
  priorities: PriorityCard[];
  executiveReport: ExecutiveReport;
  hrGuide: HrGuide;
  /** TOP gap areas (typically 2) — empty if no strong gap signal */
  gapInsights: GapInsight[];
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
