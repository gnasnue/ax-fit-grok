import {
  AX_STAGE_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLE_LABELS,
  SIZE_OPTIONS,
} from "@/lib/constants";
import { getActionsForFriction } from "@/lib/templates/actions";
import type {
  AxStage,
  CompanyContext,
  FrictionFactorId,
  RoleLayer,
} from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type {
  ExecutiveReport,
  GapInsight,
  HrGuide,
  PriorityCard,
} from "@/types/report";

function labelAxStage(stage: CompanyContext["axStage"]): string {
  return (
    AX_STAGE_OPTIONS.find((o) => o.value === stage)?.label ?? "진행 단계 미입력"
  );
}

function labelSize(size: CompanyContext["size"]): string {
  return SIZE_OPTIONS.find((o) => o.value === size)?.label ?? "규모 미입력";
}

function labelIndustry(industry: CompanyContext["industry"]): string | null {
  if (!industry) return null;
  return INDUSTRY_OPTIONS.find((o) => o.value === industry)?.label ?? null;
}

/** e.g. "제조 중견 기준으로 자주 보는 패턴입니다." — used once in one-liner */
function industryPatternCue(context: CompanyContext): string | null {
  const ind = labelIndustry(context.industry);
  if (!ind) return null;
  return `${ind} 중견 기준으로 자주 보는 패턴입니다.`;
}

/** Korean particle helpers for natural boardroom copy */
function hasBatchim(word: string): boolean {
  const ch = word.replace(/[「」]/g, "").trim().slice(-1);
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function waGwa(name: string): string {
  return hasBatchim(name) ? "과" : "와";
}

function iGa(name: string): string {
  return hasBatchim(name) ? "이" : "가";
}

export function intensityBand(score: number): "high" | "mid" | "low" {
  if (score >= 65) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/** Spec §7.2 — structural problem lines (severity by severity) */
const PROBLEM_LINES: Record<
  FrictionFactorId,
  Record<"high" | "mid" | "low", string>
> = {
  F1: {
    high: "AI 활용이 평가·보상과 분리되어, 행동이 지속되기 어려운 구조입니다.",
    mid: "평가·보상과 AX 행동의 연결이 부분적으로만 되어 있어, 실행 동기가 약해질 수 있습니다.",
    low: "평가·보상 측면은 상대적으로 안정적이나, AX 기여가 공식 지표에 더 분명히 드러나면 좋습니다.",
  },
  F2: {
    high: "중간관리자 층에서 독려 부담과 현장 현실 인식 갭이 크게 나타납니다.",
    mid: "중간관리자 층의 리드 여건이 고르지 않아, 팀 간 실행 편차가 생길 수 있습니다.",
    low: "중간관리자 여건은 양호한 편이나, 팀장 루틴을 표준화하면 확산 속도를 높일 수 있습니다.",
  },
  F3: {
    high: "목표·역할·책임이 레이어 간에 다르게 해석되고 있습니다.",
    mid: "AX 목표와 역할 경계가 일부 모호해, 실행 우선순위가 흔들릴 수 있습니다.",
    low: "역할·목표 정렬은 대체로 가능하나, 1문장 목표로 재확인하면 해석 차이를 줄일 수 있습니다.",
  },
  F4: {
    high: "교육·도구 도입이 실제 업무 방식 변화로 연결되지 못하고 있습니다.",
    mid: "교육·도구와 현업 적용 사이에 간극이 있어, 적용 파이프라인 보강이 필요합니다.",
    low: "교육-업무 연결은 비교적 양호하나, 적용 건수 지표로 관리하면 성과 증명이 쉬워집니다.",
  },
  F5: {
    high: "시간·권한·리소스 제약으로 실험과 적용이 후순위로 밀리고 있습니다.",
    mid: "시간·권한 확보가 불규칙해, 실험이 일정에 밀릴 수 있습니다.",
    low: "리소스 여건은 큰 병목이 아니나, 공식 실험 슬롯을 두면 실행 안정성이 높아집니다.",
  },
};

/** Gap-aware recommendation — redesign structures that close employee–org gaps */
const RECOMMENDATION: Record<"high" | "mid" | "low", string> = {
  high: "교육을 더 하기보다, 추진 속도와 현장 체감 사이의 갭을 줄이는 구조 재설계(평가·역할·중간관리자 루틴·적용 파이프라인)가 우선입니다.",
  mid: "교육 확대와 병행하되, 직원–조직 갭이 큰 영역 1~2개에 대해 작은 파일럿으로 구조를 먼저 손보는 편이 리스크가 낮습니다.",
  low: "전반 마찰은 낮은 편입니다. 현 상태를 유지하면서 상위 1개 영역에 가벼운 실험(2~4주)을 걸어 성과를 수치로 남기기를 권합니다.",
};

const ROLE_SPLIT = {
  executive: "목표 1문장 확정, 30일 우선순위 승인, 일관된 메시지 유지",
  hr: "진단 근거 정리, 파일럿 설계, 평가·역할 재설계 코디네이션",
  it: "권한·데이터·도구 접근 병목 제거",
  business: "파일럿 업무 선정 및 현장 피드백 제공",
} as const;

function formatTopPair(friction: FrictionScore[]): {
  phrase: string;
  topScore: number;
} {
  const top = friction[0];
  const second = friction[1];
  const topName = top?.name ?? "구조적 장벽";
  const topScore = top?.score ?? 0;

  if (second && second.score >= topScore * 0.85) {
    return {
      phrase: `「${topName}」${waGwa(topName)} 「${second.name}」`,
      topScore,
    };
  }
  return { phrase: `「${topName}」`, topScore };
}

/**
 * Spec §7.1 — one-liner reflects ax_stage + top friction + size + industry,
 * and surfaces employee–org gap when strong signals exist.
 */
export function buildOrgOneLiner(
  context: CompanyContext,
  friction: FrictionScore[],
  topGaps: GapInsight[] = [],
): string {
  const size = labelSize(context.size);
  const stage = labelAxStage(context.axStage);
  const industryCue = industryPatternCue(context);
  const { phrase, topScore } = formatTopPair(friction);
  const band = intensityBand(topScore);
  const lastName =
    friction[1] && friction[1].score >= (friction[0]?.score ?? 0) * 0.85
      ? friction[1].name
      : (friction[0]?.name ?? "구조적 장벽");
  const eul = hasBatchim(lastName) ? "을" : "를";
  const iga = iGa(lastName);

  const strongGap = topGaps.find((g) => g.severity >= 55);
  const gapSentence = strongGap
    ? strongGap.severity >= 65
      ? "회사의 추진 속도와 현장 체감 속도 사이에 뚜렷한 간극이 있습니다."
      : "회사 추진과 현장 체감 사이에 간극이 관찰됩니다."
    : null;

  const tail =
    industryCue ?? `${size} 규모 중견기업에서 자주 관찰되는 패턴입니다.`;
  const meta = `(${stage} · ${size})`;

  if (band === "low") {
    const base = `현재 AX 진행 단계(${stage})에서 전반 마찰은 낮은 편입니다. 상대적으로 ${phrase} 쪽을 가볍게 손보면 실행 안정성을 더 높일 수 있습니다.`;
    return gapSentence
      ? `${base} ${gapSentence} ${industryCue ? tail : `(${size})`}`
      : `${base} ${industryCue ? tail : `(${size})`}`;
  }

  if (band === "mid") {
    const base = `${stage} 단계에서 ${phrase} 관련 구조 이슈가 중간 수준으로 관찰됩니다.`;
    if (gapSentence) {
      return `${base} ${gapSentence} 교육 확대보다 갭을 줄이는 작은 파일럿을 권합니다. ${industryCue ? tail : meta}`;
    }
    return `${base} 교육 확대보다 해당 영역의 작은 파일럿을 권합니다. ${industryCue ? tail : meta}`;
  }

  // High band — gap-first framing when available
  if (gapSentence) {
    const highWithGap: Record<AxStage, string> = {
      not_started: `AX 초기 국면에서 ${phrase}${eul} 중심으로 구조적 장벽이 보입니다. ${gapSentence} ${industryCue ? tail : meta}`,
      education_tools: `교육과 도구 도입은 진행 중이나, ${phrase} 쪽 구조 마찰이 큽니다. ${gapSentence} ${tail}`,
      partial_apply: `일부 현업 적용 단계이나 ${phrase}${iga} 확산 병목입니다. ${gapSentence} ${industryCue ? tail : meta}`,
      enterprise_rollout: `전사 확산 시도 중에도 ${phrase} 등 구조 이슈가 남습니다. ${gapSentence} ${industryCue ? tail : `(${size})`}`,
    };
    if (context.axStage && highWithGap[context.axStage]) {
      return highWithGap[context.axStage];
    }
    return `진단 결과 ${phrase} 쪽 구조적 장벽이 두드러집니다. ${gapSentence} ${industryCue ? tail : meta}`;
  }

  const highByStage: Record<AxStage, string> = {
    not_started: `AX 초기 국면에서 ${phrase}${eul} 중심으로 구조적 장벽을 먼저 정렬할 필요가 있습니다. ${industryCue ? tail : meta}`,
    education_tools: `교육과 도구 도입은 진행 중이나, ${phrase}에서 구조적 마찰이 크게 나타나고 있습니다. ${tail}`,
    partial_apply: `일부 현업 적용 단계이나 ${phrase}${iga} 확산의 병목으로 작용하고 있습니다. ${industryCue ? tail : meta}`,
    enterprise_rollout: `전사 확산 시도 중에도 ${phrase} 등 구조 이슈가 남아 실행 일관성이 흔들릴 수 있습니다. ${industryCue ? tail : `(${size})`}`,
  };

  if (context.axStage && highByStage[context.axStage]) {
    return highByStage[context.axStage];
  }
  return `진단 결과 ${phrase} 쪽 구조적 장벽이 두드러집니다. ${industryCue ? tail : meta}`;
}

/** Single-layer org result disclaimer */
export function buildLayerDisclaimer(
  layersUsed: RoleLayer[],
): string | null {
  if (layersUsed.length !== 1) return null;
  const label = ROLE_LABELS[layersUsed[0]];
  return `본 결과는 ${label} 레이어 응답 중심이며, 전사 일반화 전 3개 레이어 추가 수집을 권장합니다.`;
}

export function buildExecutiveReport(
  context: CompanyContext,
  friction: FrictionScore[],
  priorities: PriorityCard[],
  topGaps: GapInsight[] = [],
): ExecutiveReport {
  const top3 = friction.slice(0, 3);
  const topScore = friction[0]?.score ?? 0;
  const band = intensityBand(topScore);

  // Prefer explicit gap problem lines (TOP 2), then fill with friction problems
  const gapProblems = topGaps
    .filter((g) => g.severity >= 40)
    .slice(0, 2)
    .map((g) => g.problemLine);

  const frictionProblems = top3.map((f) => {
    const line = PROBLEM_LINES[f.id][intensityBand(f.score)];
    return `${line} (진단 점수 ${f.score}/100)`;
  });

  // Dedupe loosely by first 20 chars, keep gap lines first
  const structuralProblems: string[] = [];
  for (const p of [...gapProblems, ...frictionProblems]) {
    if (structuralProblems.length >= 3) break;
    const key = p.slice(0, 24);
    if (structuralProblems.some((s) => s.startsWith(key.slice(0, 16)))) continue;
    structuralProblems.push(p);
  }

  const next30Days = priorities.slice(0, 3).flatMap((p, i) => {
    const actions = getActionsForFriction(p.frictionId, "executive");
    return actions.slice(0, 1).map((a, j) => ({
      ...a,
      id: `exec-30d-${i}-${j}`,
      byWhen: a.byWhen.includes("일") ? a.byWhen : "30일 이내",
    }));
  });

  return {
    headline: buildOrgOneLiner(context, friction, topGaps),
    structuralProblems,
    recommendation: RECOMMENDATION[band],
    roleSplit: { ...ROLE_SPLIT },
    next30Days,
  };
}

export function buildHrGuide(
  friction: FrictionScore[],
  priorities: PriorityCard[],
  topGaps: GapInsight[] = [],
): HrGuide {
  const top = friction[0];
  const topName = top?.name ?? "구조적 장벽";
  const band = intensityBand(top?.score ?? 0);
  const p0 = priorities[0];
  const n = Math.min(2, priorities.length);
  const hasStrongGap = topGaps.some((g) => g.severity >= 55);

  const eulReul = hasBatchim(topName) ? "을" : "를";
  const messageByBand: Record<"high" | "mid" | "low", string> = {
    high: hasStrongGap
      ? `지금 문제는 의지 부족이 아니라 「${topName}」과 직원–조직 갭 쪽 설계 이슈입니다. 교육 확대 전에 갭을 줄이는 「구조 재설계」 우선순위 ${n}개를 이번 분기 파일럿으로 합의해 주세요.`
      : `지금 문제는 의지 부족이 아니라 「${topName}」 쪽 설계 이슈입니다. 교육 확대 전에 「업무 재설계」 우선순위 ${n}개를 이번 분기 파일럿으로 합의해 주세요.`,
    mid: hasStrongGap
      ? `「${topName}」 관련 구조 이슈가 중간 수준이고, 직원–조직 갭 신호도 있습니다. 교육과 병행하되 갭 축소 파일럿 1~2개만 확정하는 편이 설득력 있습니다.`
      : `「${topName}」 관련 구조 이슈가 중간 수준입니다. 교육과 병행하되, 「업무 재설계」 우선순위 ${n}개 중 1~2개만 파일럿으로 확정하는 편이 설득력 있습니다.`,
    low: `전반 마찰은 낮은 편입니다. 「${topName}」${eulReul} 중심으로 2~4주 가벼운 실험 1건만 합의해도 경영진 보고용 근거를 만들 수 있습니다.`,
  };

  const discussionOrder = hasStrongGap
    ? [
        "한 줄 진단과 직원–조직 갭 TOP으로 ‘시스템 문제’ 프레이밍을 공유한다",
        "갭이 큰 영역 상위 2개를 이번 분기 구조 재설계 파일럿으로 확정한다",
        "역할 분담(경영진/HR/IT/현업)과 30일 산출물·확인 방법을 합의한다",
      ]
    : [
        "한 줄 진단과 Friction Map으로 ‘시스템 문제’ 프레이밍을 공유한다",
        "「업무 재설계」 우선순위 상위 2개만 이번 분기 파일럿으로 확정한다",
        "역할 분담(경영진/HR/IT/현업)과 30일 산출물·확인 방법을 합의한다",
      ];

  return {
    messageToExec: messageByBand[band],
    discussionOrder,
    pilotSuggestion: p0
      ? `가장 먼저: ${p0.title} — ${p0.pilotForm}`
      : "상위 마찰 요인 1개에 대한 2주 파일럿을 제안하세요.",
  };
}
