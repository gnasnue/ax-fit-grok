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

/**
 * Embed stage into a sentence without “도입 중 단계에서” style doubling.
 * e.g. "일부 현업 적용 중인 상황에서" / "아직 시작 전 단계에서"
 */
function stageSituation(stageLabel: string): string {
  if (stageLabel.endsWith("중")) return `${stageLabel}인 상황에서`;
  return `${stageLabel} 단계에서`;
}

function labelSize(size: CompanyContext["size"]): string {
  return SIZE_OPTIONS.find((o) => o.value === size)?.label ?? "규모 미입력";
}

function labelIndustry(industry: CompanyContext["industry"]): string | null {
  if (!industry) return null;
  return INDUSTRY_OPTIONS.find((o) => o.value === industry)?.label ?? null;
}

/**
 * Short context cue for boardroom — avoid stacking when diagnosis already long.
 * e.g. "제조 중견에서 자주 보이는 패턴입니다."
 */
function industryPatternCue(context: CompanyContext): string | null {
  const ind = labelIndustry(context.industry);
  if (!ind) return null;
  return `${ind} 중견에서 자주 보이는 패턴입니다.`;
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

function eulReul(name: string): string {
  return hasBatchim(name) ? "을" : "를";
}

export function intensityBand(score: number): "high" | "mid" | "low" {
  if (score >= 65) return "high";
  if (score >= 40) return "mid";
  return "low";
}

/** Structural problem sentence for a friction factor (detail panel / map click) */
export function getFrictionProblemLine(
  id: FrictionFactorId,
  score: number,
): string {
  return PROBLEM_LINES[id][intensityBand(score)];
}

/** Spec §7.2 — structural problem lines (severity by severity) */
export const PROBLEM_LINES: Record<
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

/**
 * Highlight top friction name(s) in 「」.
 * - High/mid: pair when #2 is within 85% of #1 (twin priorities)
 * - Low: always single top — dual 「」 feels over-emphasized when scores are mild
 */
function formatTopPhrase(
  friction: FrictionScore[],
  mode: "pair" | "single",
): { phrase: string; topScore: number; lastName: string; isPair: boolean } {
  const top = friction[0];
  const second = friction[1];
  const topName = top?.name ?? "구조적 장벽";
  const topScore = top?.score ?? 0;

  if (
    mode === "pair" &&
    second &&
    second.score >= topScore * 0.85
  ) {
    return {
      phrase: `「${topName}」${waGwa(topName)} 「${second.name}」`,
      topScore,
      lastName: second.name,
      isPair: true,
    };
  }
  return {
    phrase: `「${topName}」`,
    topScore,
    lastName: topName,
    isPair: false,
  };
}

/**
 * Prefer the real gap insight line (structure framing) over a generic pace template.
 * Returns null when no strong gap signal.
 */
function gapClause(topGaps: GapInsight[]): string | null {
  const strong = topGaps.find((g) => g.severity >= 55);
  if (!strong) return null;
  // problemLine is already board-ready and system-framed
  return strong.problemLine;
}

/** Join clauses without empty parts; max ~2–3 short sentences. */
function joinClauses(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type OneLinerOptions = {
  /** When true, soften certainty and append single-layer caveat */
  singleLayer?: boolean;
};

/**
 * Soften over-confident boardroom phrasing for single-layer results.
 * Structure framing kept; avoids “전사 확정” tone.
 */
function softenSingleLayerTone(text: string): string {
  let t = text
    .replace(/크게 나타나고 있습니다/g, "크게 나타나는 것으로 보입니다")
    .replace(/병목으로 작용하고 있습니다/g, "병목으로 작용하는 것으로 보입니다")
    .replace(/뚜렷한 간극이 있습니다/g, "간극이 관찰됩니다")
    .replace(/구조적 장벽이 두드러집니다/g, "구조적 장벽이 두드러져 보입니다")
    .replace(/정렬할 필요가 있습니다/g, "정렬이 필요해 보입니다")
    .replace(/흔들릴 수 있습니다/g, "흔들릴 수 있어 보입니다")
    .replace(/권합니다\./g, "권합니다(추가 레이어 확인 권장).");

  if (!t.includes("단일 레이어") && !t.includes("추가 레이어")) {
    t = `${t} 단일 레이어 응답 기준이며, 추가 레이어 확인이 필요합니다.`;
  }
  return t;
}

/**
 * Spec §7.1 — one-liner reflects ax_stage + top friction + size/industry,
 * and surfaces employee–org gap when strong signals exist.
 *
 * Boardroom rules:
 * - Readable aloud to executives without template feel
 * - 「요인」 used once, sparingly (pair only when both truly top)
 * - Structure/system framing, never person-blame
 * - Prefer 2 clauses; avoid base + gap + industry triple stack
 * - Single-layer: lower certainty (“~로 보입니다”)
 */
export function buildOrgOneLiner(
  context: CompanyContext,
  friction: FrictionScore[],
  topGaps: GapInsight[] = [],
  options: OneLinerOptions = {},
): string {
  const size = labelSize(context.size);
  const stage = labelAxStage(context.axStage);
  const industryCue = industryPatternCue(context);
  const band = intensityBand(friction[0]?.score ?? 0);
  const { phrase, lastName, isPair } = formatTopPhrase(
    friction,
    band === "low" ? "single" : "pair",
  );
  const eul = eulReul(lastName);
  const iga = iGa(lastName);
  // Dual subject → use 가/이 after pair still works (“「A」와 「B」가 …”)
  const subjectParticle = isPair ? "가" : iga;
  const objectParticle = isPair ? "를" : eul;

  const gap = gapClause(topGaps);
  // When gap is present, skip industry tail (prevents 3-sentence template stack)
  const softTail = gap ? null : industryCue;
  const sizeOnly = gap ? null : `(${size})`;

  let result: string;

  if (band === "low") {
    // Calm, single-factor nudge — no dual 「」, no heavy parentheses
    const base = joinClauses(
      `${stageSituation(stage)} 전반 마찰은 낮은 편입니다.`,
      `상대적으로 ${phrase}${objectParticle} 가볍게 손보면 실행 안정성을 더 높일 수 있습니다.`,
    );
    result = joinClauses(base, gap, softTail ?? sizeOnly);
  } else if (band === "mid") {
    const base = `${stageSituation(stage)} ${phrase} 관련 구조 이슈가 중간 수준입니다.`;
    if (gap) {
      result = joinClauses(
        base,
        gap,
        "교육 확대보다 갭을 줄이는 작은 파일럿을 권합니다.",
      );
    } else {
      result = joinClauses(
        base,
        "교육 확대보다 작은 파일럿으로 먼저 손보는 편이 낫습니다.",
        softTail ?? `(${size})`,
      );
    }
  } else {
    // ── High band ──────────────────────────────────────────────
    const highCore = ((): string => {
      switch (context.axStage) {
        case "not_started":
          return `AX 초기 국면에서 ${phrase}${objectParticle} 중심으로 구조적 장벽을 먼저 정렬할 필요가 있습니다.`;
        case "education_tools":
          return `교육과 도구 도입은 진행 중이나, ${phrase}에서 구조적 마찰이 크게 나타나고 있습니다.`;
        case "partial_apply":
          return `일부 현업 적용 단계이나 ${phrase}${subjectParticle} 확산의 병목으로 작용하고 있습니다.`;
        case "enterprise_rollout":
          return `전사 확산 시도 중에도 ${phrase} 등 구조 이슈가 남아 실행 일관성이 흔들릴 수 있습니다.`;
        default:
          return `진단 결과 ${phrase}에서 구조적 장벽이 두드러집니다.`;
      }
    })();

    result = joinClauses(
      highCore,
      gap,
      softTail ?? (gap ? null : `(${stage} · ${size})`),
    );
  }

  if (options.singleLayer) {
    return softenSingleLayerTone(result);
  }
  return result;
}

/** Single-layer org result disclaimer — null when 2+ layers */
export function buildLayerDisclaimer(
  layersUsed: RoleLayer[],
): string | null {
  if (layersUsed.length !== 1) return null;
  const label = ROLE_LABELS[layersUsed[0]];
  return `현재 1개 레이어(${label}) 응답 기준입니다. 조직 결과 일반화 전 경영진·팀장·실무자 레이어를 추가로 수집하는 것을 권장합니다. 아래 점수·문장은 참고 신호로 해석해 주세요.`;
}

export function buildExecutiveReport(
  context: CompanyContext,
  friction: FrictionScore[],
  priorities: PriorityCard[],
  topGaps: GapInsight[] = [],
  options: OneLinerOptions = {},
): ExecutiveReport {
  const top3 = friction.slice(0, 3);
  const topScore = friction[0]?.score ?? 0;
  const band = intensityBand(topScore);

  // Prefer explicit gap problem lines (TOP 2), then fill with friction problems
  const gapProblems = topGaps
    .filter((g) => g.severity >= 40)
    .slice(0, 2)
    .map((g) => {
      const line = g.problemLine;
      if (!options.singleLayer) return line;
      return line
        .replace(/뚜렷한 간극이 있습니다/g, "간극이 관찰됩니다")
        .replace(/있습니다\.$/g, "보입니다.");
    });

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

  if (options.singleLayer && structuralProblems.length > 0) {
    structuralProblems.push(
      "단일 레이어 응답 기준이므로, 다른 역할 레이어를 추가 수집한 뒤 해석을 확정하는 것이 안전합니다.",
    );
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
    headline: buildOrgOneLiner(context, friction, topGaps, options),
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
