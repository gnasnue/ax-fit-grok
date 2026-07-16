/** 3-layer diagnostic roles (spec §4–5) */
export type RoleLayer = "executive" | "manager" | "staff";

export type Industry =
  | "manufacturing"
  | "service"
  | "it_platform"
  | "retail_logistics"
  | "other";

export type CompanySize =
  | "under_300"
  | "300_1000"
  | "1000_2000"
  | "over_2000";

export type AxStage =
  | "not_started"
  | "education_tools"
  | "partial_apply"
  | "enterprise_rollout";

export type AxOwner = "hr" | "strategy" | "it" | "tft";

/** Company context collected before diagnosis (MVP must-have) */
export interface CompanyContext {
  industry: Industry | null;
  size: CompanySize | null;
  axStage: AxStage | null;
  axOwner: AxOwner | null;
}

/** Respondent context — after role, before questions */
export type JobFunction =
  | "sales"
  | "marketing"
  | "ops_quality"
  | "finance"
  | "hr_admin"
  | "it_dev"
  | "cs"
  | "strategy"
  | "other";

export type TenureBand = "under_3" | "3_7" | "7_15" | "over_15";

export type AiProficiency =
  | "rarely"
  | "occasional"
  | "frequent"
  | "leading";

export interface RespondentContext {
  jobFunction: JobFunction | null;
  tenure: TenureBand | null;
  aiLevel: AiProficiency | null;
}

export type QuestionType = "scale" | "single" | "multi";

export type FrictionFactorId = "F1" | "F2" | "F3" | "F4" | "F5";

export interface QuestionOption {
  id: string;
  label: string;
  /** Choice → friction raw points (0–100 style), per factor */
  scores?: Partial<Record<FrictionFactorId, number>>;
}

export interface Question {
  id: string;
  layer: RoleLayer;
  text: string;
  type: QuestionType;
  /**
   * scale only.
   * false (순방향): (6 - answer) * 20 — 동의↑ = 마찰↓
   * true  (역방향): answer * 20 — 동의↑ = 마찰↑
   */
  reverse?: boolean;
  /** scale items: which friction buckets receive the converted score */
  factors?: FrictionFactorId[];
  options?: QuestionOption[];
  maxSelect?: number;
}

/** scale → 1–5; single → option id; multi → option ids */
export type AnswerValue = number | string | string[];

export type AnswersByQuestionId = Record<string, AnswerValue>;
export type AnswersByLayer = Partial<Record<RoleLayer, AnswersByQuestionId>>;
