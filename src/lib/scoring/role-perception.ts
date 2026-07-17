import { FRICTION_FACTORS } from "@/lib/constants";
import {
  layerFrictionFromAnswers,
  summarizeLayersUsed,
} from "@/lib/scoring/friction";
import type {
  AnswersByLayer,
  FrictionFactorId,
  RoleLayer,
} from "@/types/diagnosis";
import type { FrictionScore } from "@/types/friction";
import type { RolePerceptionGap } from "@/types/report";

const LAYERS: RoleLayer[] = ["executive", "manager", "staff"];

const SHORT_ROLE: Record<RoleLayer, string> = {
  executive: "경영진",
  manager: "팀장",
  staff: "실무자",
};

/**
 * Build short role-layer perception comparisons for Friction Map.
 * Returns empty when fewer than 2 layers answered (UI shows fallback copy).
 */
export function computeRolePerceptionGaps(
  layers: AnswersByLayer,
  frictionMap: FrictionScore[],
): RolePerceptionGap[] {
  const used = summarizeLayersUsed(layers);
  if (used.length < 2) return [];

  const layerMeans: Partial<
    Record<RoleLayer, Record<FrictionFactorId, number>>
  > = {};
  const layerCounts: Partial<
    Record<RoleLayer, Record<FrictionFactorId, number>>
  > = {};

  for (const layer of LAYERS) {
    const answers = layers[layer];
    if (!answers || Object.keys(answers).length === 0) continue;
    const { means, counts } = layerFrictionFromAnswers(layer, answers);
    layerMeans[layer] = means;
    layerCounts[layer] = counts;
  }

  const gaps: RolePerceptionGap[] = [];

  // Prefer top-ranked frictions that have multi-layer signal
  for (const f of frictionMap.slice(0, 4)) {
    const scores: {
      executive: number | null;
      manager: number | null;
      staff: number | null;
    } = { executive: null, manager: null, staff: null };

    const present: { layer: RoleLayer; score: number }[] = [];
    for (const layer of LAYERS) {
      const counts = layerCounts[layer];
      const means = layerMeans[layer];
      if (!counts || !means || counts[f.id] <= 0) continue;
      const s = Math.round(means[f.id]);
      scores[layer] = s;
      present.push({ layer, score: s });
    }

    if (present.length < 2) continue;

    const sorted = [...present].sort((a, b) => b.score - a.score);
    const high = sorted[0]!;
    const low = sorted[sorted.length - 1]!;
    const delta = high.score - low.score;

    // Surface gaps that are visually meaningful; always keep at least top factor if multi-layer
    if (delta < 10 && gaps.length > 0) continue;

    const meta = FRICTION_FACTORS.find((m) => m.id === f.id);
    const factorName = meta?.name ?? f.name;
    const highLabel = SHORT_ROLE[high.layer];
    const lowLabel = SHORT_ROLE[low.layer];
    // Higher score = stronger friction perceived by that layer
    let statement: string;
    if (delta >= 25) {
      statement = `${highLabel} 층에서 「${factorName}」 마찰 인식이 높고, ${lowLabel}과 ${delta}점 이상 차이가 납니다.`;
    } else if (delta >= 10) {
      statement = `${highLabel}과 ${lowLabel} 사이에 「${factorName}」 인식 갭이 관찰됩니다 (${high.score} vs ${low.score}).`;
    } else {
      // Soft note for top factors with mild multi-layer spread
      statement = `「${factorName}」에 대해 ${present.map((p) => `${SHORT_ROLE[p.layer]} ${p.score}`).join(" · ")} 수준으로 나타납니다.`;
    }

    gaps.push({
      id: `rp-${f.id}`,
      frictionId: f.id,
      statement,
      layerScores: scores,
    });

    if (gaps.length >= 3) break;
  }

  return gaps;
}

/** Fallback copy when role comparison is unavailable */
export const ROLE_PERCEPTION_INSUFFICIENT =
  "레이어별 비교를 위해 추가 응답이 필요합니다.";
