import { calculateResults } from "@/lib/scoring";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  RespondentContext,
  RoleLayer,
} from "@/types/diagnosis";
import type { CalculationResult } from "@/types/report";

/**
 * /demo — skip live diagnosis.
 * Flow: load payload → /result/personal (팀장) → banner → /result/org
 *
 * HR-relatable pattern (중견 · 교육·도구 도입 중):
 * “교육·도구는 있는데, 중간관리자 여건 + 평가·보상이 안 맞는다.”
 *
 * Result shape targets:
 * - 3 layers → gaps + context multipliers + direct gap probes
 * - Clear top pair: F2 (중간관리자) + F1 (평가·보상)
 * - F3/F4/F5 secondary (not flat, not single-spike)
 * - Respondent context reflected in personal one-liner
 */

export type DemoScenarioId = "midsize_manufacturing";

export interface DemoScenarioMeta {
  id: DemoScenarioId;
  title: string;
  companyName: string;
  blurb: string;
  companyLabel: string;
}

export interface DemoPayload {
  context: CompanyContext;
  respondent: RespondentContext;
  role: RoleLayer;
  answers: Record<string, AnswerValue>;
  allLayers: AnswersByLayer;
  result: CalculationResult;
  meta: DemoScenarioMeta;
}

const MIDSIZE_MFG_META: DemoScenarioMeta = {
  id: "midsize_manufacturing",
  title: "중견 제조 · 교육·도구 도입 중",
  companyName: "한빛정밀 (가상의 중견 제조사)",
  blurb:
    "직원 약 700명 제조사. AI 교육·협업 도구는 도입했지만, 평가·팀장 여건·업무 적용이 따라오지 않아 정체된 전형적인 패턴입니다.",
  companyLabel: "제조 · 300~1,000명 (데모)",
};

/**
 * 경영진
 * - 목표·팀장은 낙관적으로 봄 (현장과 갭)
 * - KPI는 교육 이수율 → 평가·교육-업무 마찰의 신호
 * - 실제 업무 변화는 약하다고 인정
 * - 갭 프로브 EG1/EG2: 현장 변화·중간관리자 이해 약함
 */
const DEMO_EXECUTIVE: Record<string, AnswerValue> = {
  E1: 4, // vs S9=2 → F3 갭 +12
  E2: "productivity",
  E3: ["acceptance"], // 직원 수용성 (F2·F4 약) — manager_attitude 과포화 방지
  E4: 2, // 변화 약함 → F4
  E5: 3, // HR 참여 보통
  E6: 5, // 팀장 적극성 낙관 — M4=3 과 |5-(6-3)|=2 → F2 +15 classic
  E7: "training", // 교육 이수율 → F1·F4
  E8: "process", // 프로세스 우선 → F4 스토리
  EG1: 2, // 교육 대비 현장 변화 약함 → pace_adoption insight
  EG2: 3, // 중간관리자 이해 보통 약 — manager_alignment mid; F2 direct bonus 회피
};

/**
 * 팀장
 * - 활용·교육 효과 낮음, 평가지표 미연결
 * - 독려 부담 중간(3) → F2 최종 ~85–95 구간 (100 캡 회피)
 * - 지원 갭 미발동 → F2 가점 +15만
 * - 갭 프로브 MG1/MG2: 속도 차이·메시지 vs 지원 불일치
 */
const DEMO_MANAGER: Record<string, AnswerValue> = {
  M1: 3, // F5 억제
  M2: "eval", // F1
  M3: 2, // F3·F4
  M4: 3, // 역방향 F2; E6=5와 갭 → F2 +15
  M5: 3, // 지원 갭 미발동 (F2+10 회피)
  M6: 1, // F1 강화 (개인 F1 상위)
  M7: 4,
  M8: 2, // F4
  M9: 2,
  M10: "guide",
  // Gap probes — speed_gap strong + classic F2+15; 기타 F2 direct 회피
  MG1: 4, // speed_gap strong (sev 80, F2+4) → 최종 F2 ~95대 유지
  MG2: 3, // message_support mid (sev 60)
};

/**
 * 실무자
 * - 교육 효과·적용 방법 약함 → F4
 * - 평가 연결 약함 → F1 (과장 없이)
 * - 사용 빈도 중간 → F5 하위
 * - 갭 프로브 SG1/SG2: 회사 속도 앞섬·장려 vs 지원 약함
 */
const DEMO_STAFF: Record<string, AnswerValue> = {
  S1: 3,
  S2: "howto",
  S3: 1, // F4
  S4: 2, // F1 (평가 연결 약함)
  S5: 2, // F2
  S6: 3,
  S7: 4,
  S8: "howto",
  S9: 2, // F3 갭
  S10: "training", // F4
  SG1: "company_faster", // 회사 추진 > 업무 변화
  SG2: 3, // 장려 vs 지원 중간 — insight mid, F1/F2 direct 미발동
};

/** Demo personal view: 영업 7~15년차 팀장, AI 가끔 씀 */
const DEMO_RESPONDENT: RespondentContext = {
  jobFunction: "sales",
  tenure: "7_15",
  aiLevel: "occasional",
};

const DEMO_ROLE: RoleLayer = "manager";

const DEMO_CONTEXT: CompanyContext = {
  industry: "manufacturing",
  size: "300_1000",
  axStage: "education_tools",
  axOwner: "hr",
};

export function buildDemoPayload(
  scenarioId: DemoScenarioId = "midsize_manufacturing",
): DemoPayload {
  if (scenarioId !== "midsize_manufacturing") {
    throw new Error(`Unknown demo scenario: ${scenarioId}`);
  }

  const context = { ...DEMO_CONTEXT };
  const respondent = { ...DEMO_RESPONDENT };
  const role = DEMO_ROLE;
  const allLayers: AnswersByLayer = {
    executive: { ...DEMO_EXECUTIVE },
    manager: { ...DEMO_MANAGER },
    staff: { ...DEMO_STAFF },
  };
  const answers = { ...(allLayers.manager as Record<string, AnswerValue>) };

  const result = calculateResults({
    context,
    role,
    answers,
    allLayers,
    respondent,
  });

  return {
    context,
    respondent,
    role,
    answers,
    allLayers,
    result,
    meta: MIDSIZE_MFG_META,
  };
}

export function listDemoScenarios(): DemoScenarioMeta[] {
  return [MIDSIZE_MFG_META];
}
