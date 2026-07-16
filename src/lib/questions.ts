import type { FrictionFactorId, Question, RoleLayer } from "@/types/diagnosis";

/**
 * Canonical questionnaire + Friction mapping (docs/04 + Full Spec §6).
 *
 * Scale 변환 (§6.2)
 * - 순방향 reverse:false → (6 - answer) * 20  (동의↑ = 마찰↓)
 * - 역방향 reverse:true  → answer * 20         (동의↑ = 마찰↑)
 *
 * 객관식 scores: 선택지별 0–100 마찰 기여 (높을수록 해당 Friction 심각)
 */
export const QUESTIONS: Question[] = [
  // ── A. 경영진 (8) ──────────────────────────────────────────
  {
    id: "E1",
    layer: "executive",
    text: "우리 회사의 AX 추진 목표는 명확하다.",
    type: "scale",
    reverse: false,
    factors: ["F3"], // 목표 명확성 → 역할·책임
  },
  {
    id: "E2",
    layer: "executive",
    text: "AX를 통해 기대하는 가장 중요한 성과는?",
    type: "single",
    // 성과 초점이 흐릴수록 F3(목표·역할 불명확) 기여
    options: [
      { id: "productivity", label: "생산성 향상", scores: { F3: 15 } },
      { id: "cost", label: "비용 절감", scores: { F3: 15 } },
      { id: "decision", label: "의사결정 속도", scores: { F3: 15 } },
      { id: "newbiz", label: "신규 사업", scores: { F3: 20 } },
      { id: "other", label: "기타", scores: { F3: 45 } },
    ],
  },
  {
    id: "E3",
    layer: "executive",
    text: "현재 AX 추진에서 가장 큰 장애물은? (복수 선택 가능)",
    type: "multi",
    maxSelect: 3,
    options: [
      {
        id: "acceptance",
        label: "직원 수용성",
        scores: { F2: 35, F4: 30 },
      },
      {
        id: "manager_attitude",
        label: "중간관리자 태도",
        scores: { F2: 65 },
      },
      {
        id: "data_system",
        label: "데이터·시스템",
        scores: { F5: 55 },
      },
      {
        id: "budget",
        label: "예산·인력",
        scores: { F5: 60 },
      },
      {
        id: "no_goal",
        label: "명확한 목표 부재",
        scores: { F3: 65 },
      },
    ],
  },
  {
    id: "E4",
    layer: "executive",
    text: "AI 도입 후 업무 방식이나 역할이 실제로 바뀌고 있다고 생각하는가?",
    type: "scale",
    reverse: false,
    factors: ["F3", "F4"], // 역할 변화 + 교육-업무 연결
  },
  {
    id: "E5",
    layer: "executive",
    text: "HR이 AX 관련 의사결정에 충분히 참여하고 있다고 보는가?",
    type: "scale",
    reverse: false,
    factors: ["F3"], // 역할·책임 경계
  },
  {
    id: "E6",
    layer: "executive",
    text: "중간관리자들이 AX를 적극적으로 이끌고 있다고 생각하는가?",
    type: "scale",
    reverse: false,
    factors: ["F2"], // 중간관리자 태도·역량
  },
  {
    id: "E7",
    layer: "executive",
    text: "AX 성과를 어떤 지표로 주로 보고 있는가?",
    type: "single",
    // 교육/사용률 중심·불명확 → F1 높음; 생산성·비용 → F1 낮음
    options: [
      { id: "training", label: "교육 이수율", scores: { F1: 70, F4: 55 } },
      { id: "tool_usage", label: "도구 사용률", scores: { F1: 55, F4: 40 } },
      { id: "productivity", label: "생산성 지표", scores: { F1: 20 } },
      { id: "cost", label: "비용 절감", scores: { F1: 25 } },
      {
        id: "unclear",
        label: "아직 명확하지 않음",
        scores: { F1: 75, F3: 50 },
      },
    ],
  },
  {
    id: "E8",
    layer: "executive",
    text: "향후 1년 내 가장 우선적으로 바꾸고 싶은 영역은?",
    type: "single",
    // 바꾸려는 영역 = 해당 Friction이 병목이라는 신호
    options: [
      { id: "process", label: "업무 프로세스", scores: { F4: 55 } },
      { id: "role", label: "역할·직무", scores: { F3: 60 } },
      { id: "eval", label: "평가·보상", scores: { F1: 65 } },
      { id: "org", label: "조직 구조", scores: { F3: 50 } },
      { id: "capability", label: "역량 체계", scores: { F4: 50 } },
    ],
  },

  // ── B. 중간관리자 (10) ─────────────────────────────────────
  {
    id: "M1",
    layer: "manager",
    text: "우리 팀에서 AI를 업무에 실제로 활용하는 비중은?",
    type: "scale",
    reverse: false,
    factors: ["F4", "F5"], // 적용 부족 + 리소스
  },
  {
    id: "M2",
    layer: "manager",
    text: "AI를 더 활용하지 못하는 가장 큰 이유는?",
    type: "single",
    options: [
      { id: "time", label: "시간 부족", scores: { F5: 65 } },
      { id: "howto", label: "어떻게 적용할지 모름", scores: { F4: 60 } },
      { id: "eval", label: "평가에 반영 안 됨", scores: { F1: 65 } },
      { id: "attitude", label: "상사·동료 태도", scores: { F2: 55 } },
      { id: "auth", label: "권한·데이터 부족", scores: { F5: 60 } },
    ],
  },
  {
    id: "M3",
    layer: "manager",
    text: "회사의 AX 방향이 우리 팀 업무와 잘 연결되어 있다고 느끼는가?",
    type: "scale",
    reverse: false,
    factors: ["F3", "F4"],
  },
  {
    id: "M4",
    layer: "manager",
    text: "팀원들에게 AI 활용을 독려하는 것이 부담스럽다.",
    type: "scale",
    reverse: true, // 동의↑ = F2 마찰↑
    factors: ["F2"],
  },
  {
    id: "M5",
    layer: "manager",
    text: "AI를 잘 쓰는 팀원과 그렇지 않은 팀원을 다르게 평가하거나 지원하고 있는가?",
    type: "scale",
    reverse: false, // 차별 평가/지원 함 = F1 마찰↓
    factors: ["F1"],
  },
  {
    id: "M6",
    layer: "manager",
    text: "현재 성과 지표가 AI 활용을 장려하는 방향인가?",
    type: "scale",
    reverse: false,
    factors: ["F1"],
  },
  {
    id: "M7",
    layer: "manager",
    text: "팀 업무 중 AI로 대체하거나 보조하면 좋겠다고 생각하는 업무가 있는가?",
    type: "scale",
    reverse: false, // 적용 기회 인식 = 연결 여지 (낮을수록 F4↑)
    factors: ["F4"],
  },
  {
    id: "M8",
    layer: "manager",
    text: "AX 관련 교육을 받은 후 실제 업무 방식이 바뀌었는가?",
    type: "scale",
    reverse: false,
    factors: ["F4"],
  },
  {
    id: "M9",
    layer: "manager",
    text: "윗선에서 AX에 대해 기대하는 바와 현장 현실이 다르다고 느끼는가?",
    type: "scale",
    reverse: true, // 갭 느낌↑ = F2·F3↑
    factors: ["F2", "F3"],
  },
  {
    id: "M10",
    layer: "manager",
    text: "팀장으로서 AX를 이끌기 위해 가장 필요한 지원은?",
    type: "single",
    options: [
      { id: "metrics", label: "명확한 지표", scores: { F1: 55 } },
      { id: "time", label: "시간 확보", scores: { F5: 60 } },
      { id: "guide", label: "교육보다 실행 가이드", scores: { F4: 55 } },
      { id: "message", label: "경영진의 일관된 메시지", scores: { F3: 55 } },
      { id: "tools", label: "도구 접근성", scores: { F5: 50 } },
    ],
  },

  // ── C. 실무자 (10) ─────────────────────────────────────────
  {
    id: "S1",
    layer: "staff",
    text: "평소 업무에서 AI 도구를 얼마나 사용하는가?",
    type: "scale",
    reverse: false,
    factors: ["F4", "F5"],
  },
  {
    id: "S2",
    layer: "staff",
    text: "AI를 사용할 때 가장 큰 어려움은?",
    type: "single",
    options: [
      { id: "prompt", label: "무엇을 시켜야 할지 모름", scores: { F4: 60 } },
      { id: "trust", label: "결과가 신뢰 안 됨", scores: { F4: 40 } },
      { id: "slower", label: "시간이 더 걸림", scores: { F5: 55 } },
      { id: "security", label: "보안에 대한 걱정", scores: { F5: 35 } },
      { id: "none", label: "특별한 어려움 없음", scores: { F4: 5, F5: 5 } },
    ],
  },
  {
    id: "S3",
    layer: "staff",
    text: "회사의 AI/AX 관련 교육이 실제 업무에 도움이 되었는가?",
    type: "scale",
    reverse: false,
    factors: ["F4"],
  },
  {
    id: "S4",
    layer: "staff",
    text: "AI를 잘 활용하는 것이 나의 평가나 보상에 영향을 준다고 생각하는가?",
    type: "scale",
    reverse: false,
    factors: ["F1"],
  },
  {
    id: "S5",
    layer: "staff",
    text: "상사가 AI 활용을 실제로 장려한다고 느끼는가?",
    type: "scale",
    reverse: false,
    factors: ["F2"],
  },
  {
    id: "S6",
    layer: "staff",
    text: "AI 때문에 내 일이 줄어들거나 역할이 바뀔 것 같아 불안하다.",
    type: "scale",
    reverse: true, // 불안↑ = F3(역할 불명확)↑
    factors: ["F3"],
  },
  {
    id: "S7",
    layer: "staff",
    text: "현재 업무 중 AI의 도움을 받으면 확실히 좋아질 것 같은 부분이 있는가?",
    type: "scale",
    reverse: false,
    factors: ["F4"],
  },
  {
    id: "S8",
    layer: "staff",
    text: "AI를 더 잘 쓰고 싶어도 여건이 안 되는 이유는?",
    type: "single",
    options: [
      { id: "time", label: "시간 부족", scores: { F5: 65 } },
      { id: "access", label: "도구 접근 제한", scores: { F5: 60 } },
      { id: "boss", label: "상사의 관심 부족", scores: { F2: 60 } },
      { id: "howto", label: "어떻게 적용할지 모름", scores: { F4: 60 } },
      { id: "need", label: "필요를 못 느낌", scores: { F3: 40 } },
    ],
  },
  {
    id: "S9",
    layer: "staff",
    text: "회사에서 AI를 도입하는 목적이 명확하게 전달되고 있다고 생각하는가?",
    type: "scale",
    reverse: false,
    factors: ["F3"], // 갭 페어: E1
  },
  {
    id: "S10",
    layer: "staff",
    text: "AX가 성공적으로 진행되려면 가장 먼저 바뀌어야 할 것은?",
    type: "single",
    options: [
      { id: "eval", label: "평가 방식", scores: { F1: 65 } },
      { id: "boss", label: "상사의 태도", scores: { F2: 65 } },
      { id: "process", label: "업무 프로세스", scores: { F4: 55 } },
      { id: "training", label: "교육 내용", scores: { F4: 50 } },
      { id: "tools", label: "도구 자체", scores: { F5: 45 } },
    ],
  },
];

export function getQuestionsForLayer(layer: RoleLayer): Question[] {
  return QUESTIONS.filter((q) => q.layer === layer);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/** Build Friction → question id index for audit */
export function getQuestionsByFriction(): Record<FrictionFactorId, string[]> {
  const map: Record<FrictionFactorId, string[]> = {
    F1: [],
    F2: [],
    F3: [],
    F4: [],
    F5: [],
  };

  for (const q of QUESTIONS) {
    if (q.factors) {
      for (const f of q.factors) {
        if (!map[f].includes(q.id)) map[f].push(q.id);
      }
    }
    if (q.options) {
      for (const opt of q.options) {
        if (!opt.scores) continue;
        for (const f of Object.keys(opt.scores) as FrictionFactorId[]) {
          if (!map[f].includes(q.id)) map[f].push(q.id);
        }
      }
    }
  }
  return map;
}
