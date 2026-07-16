import { FRICTION_FACTORS } from "@/lib/constants";
import { getQuestionsForLayer } from "@/lib/questions";
import {
  clampScore,
  getContextMultipliers,
  getLayerWeight,
} from "@/lib/scoring/weights";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  FrictionFactorId,
  Question,
  RoleLayer,
} from "@/types/diagnosis";
import type { FrictionScore, LayerContribution } from "@/types/friction";

const FACTOR_IDS: FrictionFactorId[] = ["F1", "F2", "F3", "F4", "F5"];

/** Spec §6.2 — 5-point scale → friction points 0–100 */
export function scaleToFriction(
  answer: number,
  reverse: boolean | undefined,
): number {
  const a = Math.min(5, Math.max(1, answer));
  if (reverse) return a * 20;
  return (6 - a) * 20;
}

type FactorBuckets = Record<FrictionFactorId, number[]>;

function emptyBuckets(): FactorBuckets {
  return { F1: [], F2: [], F3: [], F4: [], F5: [] };
}

function applyChoiceScores(
  buckets: FactorBuckets,
  question: Question,
  value: AnswerValue,
) {
  if (!question.options) return;
  const ids = Array.isArray(value) ? value : [String(value)];
  for (const id of ids) {
    const opt = question.options.find((o) => o.id === id);
    if (!opt?.scores) continue;
    for (const [fid, score] of Object.entries(opt.scores)) {
      buckets[fid as FrictionFactorId].push(score as number);
    }
  }
}

/** Per-layer mean scores + sample counts (0 when no samples for a factor) */
export function layerFrictionFromAnswers(
  layer: RoleLayer,
  answers: Record<string, AnswerValue>,
): {
  means: Record<FrictionFactorId, number>;
  counts: Record<FrictionFactorId, number>;
} {
  const buckets = emptyBuckets();
  const questions = getQuestionsForLayer(layer);

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) continue;
    if (Array.isArray(raw) && raw.length === 0) continue;
    if (typeof raw === "string" && raw.length === 0) continue;

    if (q.type === "scale" && typeof raw === "number") {
      const pts = scaleToFriction(raw, q.reverse);
      for (const f of q.factors ?? []) {
        buckets[f].push(pts);
      }
    } else if (q.type === "single" || q.type === "multi") {
      applyChoiceScores(buckets, q, raw);
    }
  }

  const means = {} as Record<FrictionFactorId, number>;
  const counts = {} as Record<FrictionFactorId, number>;
  for (const id of FACTOR_IDS) {
    const arr = buckets[id];
    counts[id] = arr.length;
    means[id] = arr.length
      ? arr.reduce((a, b) => a + b, 0) / arr.length
      : 0;
  }
  return { means, counts };
}

function avgScale(
  answers: Record<string, AnswerValue> | undefined,
  questionId: string,
): number | null {
  if (!answers) return null;
  const v = answers[questionId];
  return typeof v === "number" ? v : null;
}

/**
 * Spec §6.4 gap bonuses (only when both sides answered the pair)
 *
 * | 갭 | 문항 쌍 | 조건 | 가점 |
 * |----|---------|------|------|
 * | 목표 명확성 | E1 vs S9 | |Δ|≥1.5 | F3 +12 |
 * | 중간관리자 적극성 | E6 vs (6−M4) | |Δ|≥1.5 | F2 +15 |
 * | 지원 인식 | M5 vs S5 | |Δ|≥1.5 | F2 +10 |
 *
 * M4는 역방향 문항(독려 부담). 6−M4 = 팀장 측 적극성/여유 프록시.
 * M5(팀장이 차별 평가·지원) vs S5(실무자가 상사 장려 체감) = 지원 인식 갭.
 */
export function computeGapBonuses(
  layers: AnswersByLayer,
): Record<FrictionFactorId, number> {
  const bonus: Record<FrictionFactorId, number> = {
    F1: 0,
    F2: 0,
    F3: 0,
    F4: 0,
    F5: 0,
  };

  // 1) exec vs staff 목표 명확성 → F3 +12
  const execGoal = avgScale(layers.executive, "E1");
  const staffGoal = avgScale(layers.staff, "S9");
  if (
    execGoal !== null &&
    staffGoal !== null &&
    Math.abs(execGoal - staffGoal) >= 1.5
  ) {
    bonus.F3 += 12;
  }

  // 2) exec vs manager 적극성 → F2 +15
  const execMgrDrive = avgScale(layers.executive, "E6");
  const mgrBurden = avgScale(layers.manager, "M4");
  if (execMgrDrive !== null && mgrBurden !== null) {
    const mgrProactivityProxy = 6 - mgrBurden;
    if (Math.abs(execMgrDrive - mgrProactivityProxy) >= 1.5) {
      bonus.F2 += 15;
    }
  }

  // 3) manager vs staff 지원 인식 → F2 +10
  const mgrSupport = avgScale(layers.manager, "M5");
  const staffSupport = avgScale(layers.staff, "S5");
  if (
    mgrSupport !== null &&
    staffSupport !== null &&
    Math.abs(mgrSupport - staffSupport) >= 1.5
  ) {
    bonus.F2 += 10;
  }

  return bonus;
}

export function computeFrictionScores(
  layers: AnswersByLayer,
  context: CompanyContext,
): FrictionScore[] {
  const weightedSum: Record<FrictionFactorId, number> = {
    F1: 0,
    F2: 0,
    F3: 0,
    F4: 0,
    F5: 0,
  };
  const weightTotal: Record<FrictionFactorId, number> = {
    F1: 0,
    F2: 0,
    F3: 0,
    F4: 0,
    F5: 0,
  };

  (["executive", "manager", "staff"] as RoleLayer[]).forEach((layer) => {
    const answers = layers[layer];
    if (!answers || Object.keys(answers).length === 0) return;

    const { means, counts } = layerFrictionFromAnswers(layer, answers);
    const w = getLayerWeight(layer);

    for (const id of FACTOR_IDS) {
      // Only contribute when this layer actually sampled the factor
      if (counts[id] <= 0) continue;
      weightedSum[id] += means[id] * w;
      weightTotal[id] += w;
    }
  });

  const gaps = computeGapBonuses(layers);
  const multipliers = getContextMultipliers(context);

  return FRICTION_FACTORS.map((meta) => {
    // Neutral baseline only if no layer contributed samples
    const base =
      weightTotal[meta.id] > 0
        ? weightedSum[meta.id] / weightTotal[meta.id]
        : 40;
    const gapBonus = gaps[meta.id];
    const mult = multipliers[meta.id];
    const score = clampScore((base + gapBonus) * mult);

    return {
      id: meta.id,
      name: meta.name,
      score,
      baseScore: clampScore(base),
      gapBonus,
      contextMultiplier: mult,
    };
  }).sort((a, b) => b.score - a.score);
}

/** Personal view: current participant layer only (no gap / context) */
export function computePersonalFriction(
  layer: RoleLayer,
  answers: Record<string, AnswerValue>,
): FrictionScore[] {
  const { means, counts } = layerFrictionFromAnswers(layer, answers);

  return FRICTION_FACTORS.map((meta) => {
    const has = counts[meta.id] > 0;
    const base = has ? means[meta.id] : 0;
    return {
      id: meta.id,
      name: meta.name,
      score: clampScore(base),
      baseScore: clampScore(base),
      gapBonus: 0,
      contextMultiplier: 1,
    };
  }).sort((a, b) => b.score - a.score);
}

export function summarizeLayersUsed(
  layers: AnswersByLayer,
): LayerContribution[] {
  return (["executive", "manager", "staff"] as RoleLayer[])
    .map((layer) => {
      const answers = layers[layer];
      const answeredCount = answers ? Object.keys(answers).length : 0;
      return {
        layer,
        weight: getLayerWeight(layer),
        answeredCount,
      };
    })
    .filter((l) => l.answeredCount > 0);
}
