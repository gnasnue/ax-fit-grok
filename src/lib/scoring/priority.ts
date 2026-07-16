import type { FrictionFactorId } from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type { PriorityCard } from "@/types/report";

/** 「업무 재설계」 mapping — structural redesign, not "more training" */
const REDESIGN: Record<
  FrictionFactorId,
  {
    title: string;
    pilotForm: string;
    roles: PriorityCard["roles"];
    successMetric: string;
    rationaleTemplate: (score: number, name: string) => string;
  }
> = {
  F1: {
    title: "평가·보상과 AX 행동 연결",
    pilotForm: "1개 팀 파일럿: AI 기여 로그 → 분기 평가 항목 1개 반영",
    roles: {
      hr: "평가 항목 초안·가이드 배포",
      manager: "팀 내 기여 사례 주 1회 기록",
      it: "최소 사용 로그/산출물 링크 수집",
    },
    successMetric: "파일럿 팀 평가 시트에 AX 기여 항목 반영 여부 (Y/N)",
    rationaleTemplate: (score, name) =>
      score >= 65
        ? `「${name}」 진단 점수 ${score}/100 — AI 행동이 보상 체계와 분리되어 지속 동력이 약합니다.`
        : score >= 40
          ? `「${name}」 진단 점수 ${score}/100 — 평가·보상 연결이 부분적이라 동기 부여가 약해질 수 있습니다.`
          : `「${name}」 진단 점수 ${score}/100 — 평가 측면은 양호한 편이나, AX 기여 항목을 공식화하면 성과 증명이 쉬워집니다.`,
  },
  F2: {
    title: "중간관리자 실행 여건 재설계",
    pilotForm: "팀장 대상: 독려 스크립트 + 주간 15분 리뷰 루틴 파일럿",
    roles: {
      hr: "루틴·스크립트 설계 및 코칭",
      manager: "주간 리뷰 실행·장애 공유",
      it: "팀장용 도구 접근·템플릿 제공",
    },
    successMetric: "주간 리뷰 완료율 + 팀원 ‘상사 장려’ 펄스 점수 변화",
    rationaleTemplate: (score, name) =>
      score >= 65
        ? `「${name}」 진단 점수 ${score}/100 — 중간관리자 층의 독려·여건 설계가 핵심 병목입니다.`
        : score >= 40
          ? `「${name}」 진단 점수 ${score}/100 — 팀장 루틴을 표준화하면 실행 편차를 줄일 수 있습니다.`
          : `「${name}」 진단 점수 ${score}/100 — 큰 병목은 아니나, 팀장 루틴 정비로 확산 속도를 높일 수 있습니다.`,
  },
  F3: {
    title: "역할·책임·목표 재정의",
    pilotForm: "핵심 프로세스 1개 RACI + AX 목표 1문장 정렬 워크숍",
    roles: {
      hr: "RACI 워크숍 진행",
      manager: "팀 역할 초안 작성",
      it: "시스템 권한·데이터 오너 정의",
    },
    successMetric: "합의된 RACI 문서 1종 + 경영진 승인 (Y/N)",
    rationaleTemplate: (score, name) =>
      score >= 65
        ? `「${name}」 진단 점수 ${score}/100 — 목표·역할이 레이어마다 다르게 해석되고 있습니다.`
        : score >= 40
          ? `「${name}」 진단 점수 ${score}/100 — 목표·역할 해석 차이가 일부 존재합니다.`
          : `「${name}」 진단 점수 ${score}/100 — 정렬은 가능한 수준이나, 1문장 목표로 재확인하면 좋습니다.`,
  },
  F4: {
    title: "교육 → 업무 적용 파이프라인",
    pilotForm: "교육 이수율 대신 ‘업무 1건 적용’ 2주 스프린트",
    roles: {
      hr: "적용 과제 템플릿·체크리스트",
      manager: "팀 과제 선정·장벽 제거",
      it: "실제 업무 데이터/도구 연결",
    },
    successMetric: "교육 이수 대비 실제 업무 적용 건수 (목표: 인당 1건+)",
    rationaleTemplate: (score, name) =>
      score >= 65
        ? `「${name}」 진단 점수 ${score}/100 — 교육·도구가 업무 방식 변화로 이어지지 않습니다.`
        : score >= 40
          ? `「${name}」 진단 점수 ${score}/100 — 교육과 현업 적용 사이에 간극이 있습니다.`
          : `「${name}」 진단 점수 ${score}/100 — 연결은 양호한 편이나, 적용 건수로 관리하면 성과 증명이 쉽습니다.`,
  },
  F5: {
    title: "시간·권한·리소스 확보",
    pilotForm: "주 2시간 AX 실험 슬롯 + 권한 패키지 일괄 배포",
    roles: {
      hr: "슬롯 정책 문서화",
      manager: "일정 보호·우선순위 조정",
      it: "권한·라이선스·데이터 접근 부여",
    },
    successMetric: "슬롯 사용률 + 접근 차단 티켓 감소",
    rationaleTemplate: (score, name) =>
      score >= 65
        ? `「${name}」 진단 점수 ${score}/100 — 실행할 시간·권한이 후순위로 밀리고 있습니다.`
        : score >= 40
          ? `「${name}」 진단 점수 ${score}/100 — 시간·권한 확보가 불규칙해 실험이 밀릴 수 있습니다.`
          : `「${name}」 진단 점수 ${score}/100 — 리소스는 큰 병목이 아니나, 공식 실험 슬롯이 있으면 안정적입니다.`,
  },
};

/** Spec §6.6 — top frictions → 「업무 재설계」 priorities (low: 2, else up to 4) */
export function buildPriorities(
  frictionScores: FrictionScore[],
  topN = 4,
): PriorityCard[] {
  return frictionScores.slice(0, topN).map((f, index) => {
    const t = REDESIGN[f.id];
    return {
      id: `P${index + 1}`,
      frictionId: f.id,
      title: t.title,
      rationale: t.rationaleTemplate(f.score, f.name),
      pilotForm: t.pilotForm,
      roles: t.roles,
      successMetric: t.successMetric,
      score: f.score,
    };
  });
}
