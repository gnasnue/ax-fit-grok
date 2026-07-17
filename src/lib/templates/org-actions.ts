import { FRICTION_FACTORS } from "@/lib/constants";
import type { FrictionFactorId } from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type {
  GapInsight,
  OrgActionCard,
  ActionAudience,
} from "@/types/report";

type ActionTemplate = {
  title: string;
  who: string;
  byWhen: string;
  successMetrics: string[];
  nextAction: string;
  /**
   * Diagnostic rationale (structure framing).
   * Prefer friction-specific copy; do not dump unrelated gap lines.
   */
  whyNow: (score: number, name: string) => string;
};

function scoreLabel(score: number): string {
  return `${Math.round(score)}/100`;
}

/** HR operational actions — clear action titles, system framing */
const HR_TEMPLATES: Record<FrictionFactorId, ActionTemplate> = {
  F1: {
    title: "평가·보상 체계에 AI 활용 항목 1개 추가 초안 작성",
    who: "HR",
    byWhen: "2주 이내",
    successMetrics: [
      "평가 항목 초안 1종 완성 (Y/N)",
      "경영진·팀장 피드백 1회 이상 수집",
    ],
    nextAction:
      "현행 평가 항목 중 AI와 충돌하거나 누락된 항목부터 리스트업하세요",
    whyNow: (score, name) =>
      score >= 70
        ? `AI를 활용해도 인정받지 못한다는 인식이 실무자와 팀장 모두에서 높게 나타납니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 진단 ${scoreLabel(score)} — 평가·보상 연결이 부분적이라 실행 동력이 약해질 수 있습니다.`,
  },
  F2: {
    title: "팀장 주간 15분 AX 리뷰 루틴 체크리스트 배포",
    who: "HR",
    byWhen: "2주 이내",
    successMetrics: [
      "체크리스트 배포 완료 (Y/N)",
      "파일럿 팀장 사용률 50%+",
    ],
    nextAction:
      "팀장 3명에게 현재 독려 방식과 막히는 점을 15분 인터뷰로 수집하세요",
    whyNow: (score, name) =>
      score >= 70
        ? `중간관리자 층의 독려·실행 여건이 핵심 병목으로 나타나고 있습니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 진단 ${scoreLabel(score)} — 팀장 루틴을 표준화하면 실행 편차를 줄일 수 있습니다.`,
  },
  F3: {
    title: "핵심 프로세스 1개 RACI 초안 작성",
    who: "HR",
    byWhen: "2주 이내",
    successMetrics: [
      "RACI 초안 1종 작성 (Y/N)",
      "현업 리더 1명 이상 합의",
    ],
    nextAction:
      "역할이 겹치거나 비어 있는 AX 관련 업무 1개를 오늘 목록에서 고르세요",
    whyNow: (score, name) =>
      score >= 70
        ? `목표·역할·책임이 레이어마다 다르게 해석되어 실행 우선순위가 흔들리고 있습니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 진단 ${scoreLabel(score)} — 목표·역할 해석 차이가 일부 존재합니다.`,
  },
  F4: {
    title: "교육 이수율 대신 ‘업무 적용 건수’ 추적 폼 시범 운영",
    who: "HR",
    byWhen: "2주 이내",
    successMetrics: [
      "적용 추적 폼 1팀 시범 배포 (Y/N)",
      "인당 적용 건수 1건+ 응답 확보",
    ],
    nextAction:
      "최근 교육 1건을 골라 ‘업무 적용 1건’ 제출 문항을 폼에 추가하세요",
    whyNow: (score, name) =>
      score >= 70
        ? `교육·도구 도입이 실제 업무 방식 변화로 이어지지 않는 구조가 확인됩니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 진단 ${scoreLabel(score)} — 교육과 현업 적용 사이에 간극이 있습니다.`,
  },
  F5: {
    title: "주 2시간 AX 실험 슬롯 정책 초안 문서화",
    who: "HR",
    byWhen: "2주 이내",
    successMetrics: [
      "정책 메모 1페이지 완성 (Y/N)",
      "파일럿 팀 슬롯 사용률 집계 시작",
    ],
    nextAction:
      "실험 시간을 막는 일정·권한 장벽 3개를 현장 팀장 1명에게 오늘 물어보세요",
    whyNow: (score, name) =>
      score >= 70
        ? `실행할 시간·권한이 후순위로 밀려 실험이 정체되는 구조입니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 진단 ${scoreLabel(score)} — 시간·권한 확보가 불규칙해 실험이 밀릴 수 있습니다.`,
  },
};

/**
 * 경영진에 요청할 일 — 승인·메시지·우선순위 합의.
 * 제목 = 경영진이 할 결정 / 다음 액션 = HR이 오늘 착수할 요청 준비.
 */
const EXEC_TEMPLATES: Record<FrictionFactorId, ActionTemplate> = {
  F1: {
    title: "분기 평가에 AI 기여 항목 1개 반영 승인",
    who: "경영진",
    byWhen: "30일 이내",
    successMetrics: [
      "평가 항목 반영 승인 (Y/N)",
      "파일럿 팀 적용 공지 완료",
    ],
    nextAction:
      "평가 항목 초안 1쪽을 붙여 이번 주 경영회의 안건으로 올리세요",
    whyNow: (score, name) =>
      score >= 70
        ? `AI 행동이 보상 체계와 분리되어 있어, 경영진 승인 없이는 지속 동력이 생기기 어렵습니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 관련 평가 연결이 부분적이라 경영진의 공식 승인이 실행 신호로 필요합니다.`,
  },
  F2: {
    title: "팀장 AX 주간 리뷰 루틴 공식 승인·메시지 발송",
    who: "경영진",
    byWhen: "30일 이내",
    successMetrics: [
      "경영진 메시지 1통 발송 (Y/N)",
      "팀장 주간 리뷰 완료율 집계",
    ],
    nextAction:
      "‘팀장 주간 15분 AX 리뷰’ 1페이지 초안을 붙여 이번 주 경영회의 안건으로 올리세요",
    whyNow: (score, name) =>
      score >= 70
        ? `중간관리자 층의 실행 여건이 병목입니다. 경영진의 공식 루틴 승인 없이는 팀 간 편차가 유지됩니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 여건을 표준화하려면 경영진의 운영 메시지 지원이 필요합니다.`,
  },
  F3: {
    title: "전사 AX 목표를 측정 가능한 1문장으로 확정",
    who: "경영진",
    byWhen: "2주 이내",
    successMetrics: [
      "목표 문장 문서 승인 (Y/N)",
      "레이어별 목표 인식 펄스 1회",
    ],
    nextAction:
      "목표 초안 1문장과 Non-goal 1~2개를 적어 이번 주 경영회의에 올리세요",
    whyNow: (score, name) =>
      score >= 70
        ? `목표·역할이 레이어마다 다르게 해석되고 있어 경영진의 1문장 정렬이 선행되어야 합니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 해석 차이를 줄이려면 경영진의 목표 1문장 확정이 효과적입니다.`,
  },
  F4: {
    title: "교육 KPI를 ‘업무 적용 건수’로 교체 승인",
    who: "경영진",
    byWhen: "30일 이내",
    successMetrics: [
      "지표 교체 공지 (Y/N)",
      "월간 적용 건수 집계 시작",
    ],
    nextAction:
      "이수율→적용 건수 교체 1페이지 안을 이번 분기 KPI 회의에 안건으로 넣으세요",
    whyNow: (score, name) =>
      score >= 70
        ? `교육·도구 투자가 업무 변화로 증명되지 않으면 성과 보고 근거가 약해집니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 간극을 수치로 관리하려면 적용 KPI 승인이 필요합니다.`,
  },
  F5: {
    title: "주 2시간 AX 실험 시간 공식 인정",
    who: "경영진",
    byWhen: "2주 이내",
    successMetrics: [
      "정책 메모 배포 (Y/N)",
      "슬롯 사용률 집계 시작",
    ],
    nextAction:
      "실험 시간을 ‘공식 업무’로 인정하는 한 줄 메시지 초안을 오늘 경영진 캘린더에 리뷰 요청하세요",
    whyNow: (score, name) =>
      score >= 70
        ? `시간·권한이 후순위로 밀리는 구조라, 경영진의 공식 시간 인정이 실행 조건을 바꿉니다 (진단 ${scoreLabel(score)}).`
        : `「${name}」 실험이 일정에 밀리지 않으려면 경영진의 슬롯 인정이 도움이 됩니다.`,
  },
};

function frictionLabel(id: FrictionFactorId, name: string): string {
  return `${id} · ${name}`;
}

function buildCard(
  audience: ActionAudience,
  priority: "P1" | "P2",
  f: FrictionScore,
  template: ActionTemplate,
  _gaps: GapInsight[],
  index: number,
): OrgActionCard {
  // Gap insights feed the Friction Map / one-liner — do not overwrite
  // action rationale with a weakly related gap problem line.
  void _gaps;
  return {
    id: `${audience}-${f.id}-${index}`,
    priority,
    audience,
    frictionId: f.id,
    frictionLabel: frictionLabel(f.id, f.name),
    title: template.title,
    whyNow: template.whyNow(f.score, f.name),
    who: template.who,
    byWhen: template.byWhen,
    successMetrics: template.successMetrics,
    nextAction: template.nextAction,
  };
}

/**
 * Build HR (2–3) + executive (2) action cards from top friction scores.
 * Copy comes from templates + optional gap hints — never page hardcoding.
 */
export function buildOrgActionCards(
  frictionMap: FrictionScore[],
  gapInsights: GapInsight[] = [],
): OrgActionCard[] {
  const ranked = [...frictionMap].sort((a, b) => b.score - a.score);
  const hrCount = ranked[0] && ranked[0].score < 40 ? 2 : 3;
  const hrFactors = ranked.slice(0, hrCount);
  const execFactors = ranked.slice(0, 2);

  const cards: OrgActionCard[] = [];

  hrFactors.forEach((f, i) => {
    const t = HR_TEMPLATES[f.id];
    cards.push(
      buildCard("hr", i === 0 ? "P1" : "P2", f, t, gapInsights, i),
    );
  });

  execFactors.forEach((f, i) => {
    const t = EXEC_TEMPLATES[f.id];
    cards.push(
      buildCard("executive", i === 0 ? "P1" : "P2", f, t, gapInsights, i),
    );
  });

  return cards;
}

export function getFrictionMetaName(id: FrictionFactorId): string {
  return FRICTION_FACTORS.find((f) => f.id === id)?.name ?? id;
}
