import {
  AI_LEVEL_OPTIONS,
  JOB_FUNCTION_OPTIONS,
  TENURE_OPTIONS,
} from "@/lib/constants";
import {
  getActionsForFriction,
  getJobBranchedAction,
} from "@/lib/templates/actions";
import type {
  AiProficiency,
  FrictionFactorId,
  JobFunction,
  RespondentContext,
  RoleLayer,
  TenureBand,
} from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type { ActionItem, PersonalResult } from "@/types/report";

/**
 * Spec §8 — summary by role × top friction (system framing, not person-blame)
 */
const SUMMARY: Record<RoleLayer, Record<FrictionFactorId, string>> = {
  executive: {
    F1: "평가·보상과 AX 행동이 분리되어 있습니다. 지표를 교육 이수율에서 업무 기여로 옮기지 않으면 실행이 형식화될 위험이 큽니다.",
    F2: "중간관리자 층의 리드·여건이 핵심 병목으로 보입니다. 의지 부족이 아니라 역할·루틴 설계 이슈로 다루는 것이 맞습니다.",
    F3: "목표·역할·책임이 조직 전반에 동일하게 전달되지 않고 있습니다. 1문장 목표와 RACI 정렬이 우선입니다.",
    F4: "교육·도구 투자가 업무 방식 변화로 전환되지 못하고 있습니다. 적용 건수 중심의 파이프라인이 필요합니다.",
    F5: "시간·권한·리소스 제약이 실험을 후순위로 밀고 있습니다. 공식 실험 슬롯과 권한 패키지가 선행 조건입니다.",
  },
  manager: {
    F1: "AI 활용이 평가에 반영되지 않아 독려가 지속되기 어렵습니다. 팀 단위 기여 기록과 평가 항목 1개가 필요합니다.",
    F2: "독려 부담과 현장 현실 갭이 크게 느껴집니다. 개인 역량 문제가 아니라, 팀장 실행 루틴·여건 설계 이슈로 보는 것이 맞습니다.",
    F3: "회사 AX 방향과 팀 업무 연결이 약합니다. 팀 RACI와 목표 해석을 먼저 맞추는 것이 효과적입니다.",
    F4: "교육 이후 업무 적용이 약합니다. ‘업무 1건 적용’ 스프린트로 연결 고리를 만드는 것이 우선입니다.",
    F5: "시간과 권한이 부족해 실험이 밀릴 수 있습니다. 주간 실험 슬롯을 공식 보호하는 것이 가장 빠른 레버입니다.",
  },
  staff: {
    F1: "AI 활용이 평가·보상과 연결되어 보이지 않습니다. 기여를 남길 간단한 기록 방식이 동기 부여에 도움이 됩니다.",
    F2: "상사의 실제 장려가 약하게 느껴집니다. 개인 탓이 아니라 관리자 루틴·메시지 설계 문제로 접근해야 합니다.",
    F3: "AI 도입 목적과 역할 경계가 불명확합니다. ‘해도 되는 일 / 확인이 필요한 일’ 정리가 불안을 줄입니다.",
    F4: "교육이 업무 적용으로 이어지지 않습니다. 반복 업무 1개에 바로 적용해 보는 것이 가장 빠른 학습입니다.",
    F5: "시간·도구 접근 제약이 큽니다. 짧은 실험 시간을 스스로 확보하는 것부터 시작하는 것이 현실적입니다.",
  },
};

const FALLBACK: Record<RoleLayer, string> = {
  executive:
    "구조적 장벽이 확인됩니다. 교육 확대보다 평가·역할·중간관리자 조건을 먼저 정렬하는 것이 효과적입니다.",
  manager:
    "구조적 장벽이 확인됩니다. 개인 독려만으로는 한계가 있으며 지표·루틴·권한이 함께 바뀌어야 합니다.",
  staff:
    "구조적 장벽이 확인됩니다. 역량 부족이 아니라 시스템 조건(평가·상사·시간)을 손보는 방향이 맞습니다.",
};

const LOW_PREFIX: Record<RoleLayer, string> = {
  executive:
    "전반 마찰은 낮은 편입니다. 상대적으로 눈에 띄는 지점은 다음과 같습니다. ",
  manager:
    "전반 마찰은 낮은 편입니다. 상대적으로 손볼 여지는 다음과 같습니다. ",
  staff:
    "전반 마찰은 낮은 편입니다. 상대적으로 챙기면 좋은 지점은 다음과 같습니다. ",
};

function labelJob(j: JobFunction | null | undefined): string | null {
  if (!j) return null;
  return JOB_FUNCTION_OPTIONS.find((o) => o.value === j)?.label ?? null;
}

function labelTenure(t: TenureBand | null | undefined): string | null {
  if (!t) return null;
  return TENURE_OPTIONS.find((o) => o.value === t)?.label ?? null;
}

function labelAi(a: AiProficiency | null | undefined): string | null {
  if (!a) return null;
  return AI_LEVEL_OPTIONS.find((o) => o.value === a)?.label ?? null;
}

/**
 * Context prefix: "영업 7~15년차 팀장 기준으로 보면,"
 */
function buildContextPrefix(
  role: RoleLayer,
  respondent: RespondentContext | null | undefined,
): string | null {
  if (!respondent) return null;
  const job = labelJob(respondent.jobFunction);
  const tenure = labelTenure(respondent.tenure);
  const roleLabel =
    role === "executive"
      ? "경영진"
      : role === "manager"
        ? "팀장"
        : "실무자";

  const parts: string[] = [];
  if (job) parts.push(job);
  if (tenure) parts.push(`${tenure}차`);
  parts.push(roleLabel);

  if (parts.length <= 1) return null;
  return `${parts.join(" ")} 기준으로 보면,`;
}

/**
 * Soften / sharpen summary tail by AI level
 */
function aiLevelCue(
  ai: AiProficiency | null | undefined,
  primaryId: FrictionFactorId | undefined,
): string | null {
  if (!ai || !primaryId) return null;
  if (ai === "rarely" && (primaryId === "F4" || primaryId === "F5")) {
    return " AI 사용 경험이 적은 편이라, 작은 적용부터 시작하는 편이 현실적입니다.";
  }
  if (ai === "leading" && (primaryId === "F1" || primaryId === "F2")) {
    return " 팀에서 앞서 쓰는 편인데도 평가·여건이 따라오지 않으면 독려 부담이 더 커질 수 있습니다.";
  }
  if (ai === "frequent" && primaryId === "F1") {
    return " 업무에 자주 쓰는 편이라면 평가 반영 부재가 더 크게 체감될 수 있습니다.";
  }
  return null;
}

export function buildPersonalResult(
  role: RoleLayer,
  personalFriction: FrictionScore[],
  respondent: RespondentContext | null = null,
): PersonalResult {
  const top = personalFriction.slice(0, 3);
  const primary = top[0];

  let body = primary ? SUMMARY[role][primary.id] : FALLBACK[role];
  const prefix = buildContextPrefix(role, respondent);
  const aiCue = aiLevelCue(respondent?.aiLevel, primary?.id);

  let summary: string;
  if (prefix) {
    // e.g. "영업 7~15년차 팀장 기준으로 보면, 독려 부담과 평가 반영 부족이 크게 느껴지는 패턴입니다."
    // Use friction-aware short body after prefix
    const shortBody = primary
      ? shortFrictionLine(role, primary.id)
      : FALLBACK[role];
    summary = `${prefix} ${shortBody}`;
  } else {
    summary = body;
  }

  if (primary && primary.score < 40) {
    summary = LOW_PREFIX[role] + summary;
  }

  if (aiCue) {
    summary = summary.replace(/\.$/, "") + "." + aiCue;
  }

  // Micro actions: job-branched primary + role friction secondary
  const microActions = buildMicroActions(role, top, respondent);

  return {
    role,
    summary,
    topFrictions: top,
    microActions,
  };
}

function shortFrictionLine(role: RoleLayer, id: FrictionFactorId): string {
  const lines: Record<RoleLayer, Record<FrictionFactorId, string>> = {
    executive: {
      F1: "평가·보상 연결과 지표 재설계가 시급한 패턴입니다.",
      F2: "중간관리자 여건·루틴 설계가 핵심 병목으로 보입니다.",
      F3: "목표·역할 정렬 갭이 크게 느껴지는 패턴입니다.",
      F4: "교육·도구 대비 현장 적용 전환이 약한 패턴입니다.",
      F5: "시간·권한·리소스 제약이 실험 후순위를 만드는 패턴입니다.",
    },
    manager: {
      F1: "독려 부담과 평가 반영 부족이 크게 느껴지는 패턴입니다.",
      F2: "독려 부담과 현장 현실 갭이 크게 느껴지는 패턴입니다.",
      F3: "회사 방향과 팀 업무 연결이 약한 패턴입니다.",
      F4: "교육 이후 업무 적용 고리가 약한 패턴입니다.",
      F5: "시간·권한 부족으로 실험이 밀리는 패턴입니다.",
    },
    staff: {
      F1: "AI 활용이 평가·보상과 분리되어 보이는 패턴입니다.",
      F2: "상사의 실제 장려가 약하게 체감되는 패턴입니다.",
      F3: "도입 목적·역할 경계가 불명확한 패턴입니다.",
      F4: "교육이 업무 적용으로 이어지지 않는 패턴입니다.",
      F5: "시간·도구 제약이 크게 체감되는 패턴입니다.",
    },
  };
  return lines[role][id];
}

function buildMicroActions(
  role: RoleLayer,
  top: FrictionScore[],
  respondent: RespondentContext | null,
): ActionItem[] {
  const actions: ActionItem[] = [];
  const job = respondent?.jobFunction ?? null;

  const usedFrictions = new Set<FrictionFactorId>();

  // Primary: job-branched if available
  if (top[0] && job) {
    const jobAction = getJobBranchedAction(top[0].id, role, job);
    if (jobAction) {
      actions.push({ ...jobAction, id: `micro-${role}-job-0` });
      usedFrictions.add(top[0].id);
    }
  }

  // Fill with standard role actions across top frictions (avoid duplicate factor)
  for (const f of top.slice(0, 3)) {
    if (actions.length >= 2) break;
    if (usedFrictions.has(f.id)) continue;
    const std = getActionsForFriction(f.id, role)[0];
    if (!std) continue;
    if (actions.some((a) => a.title === std.title)) continue;
    actions.push({ ...std, id: `micro-${role}-${actions.length}` });
    usedFrictions.add(f.id);
  }

  // Ensure at least one
  if (actions.length === 0 && top[0]) {
    const std = getActionsForFriction(top[0].id, role);
    return std.slice(0, 2).map((a, i) => ({
      ...a,
      id: `micro-${role}-${i}`,
    }));
  }

  return actions.slice(0, 2);
}
