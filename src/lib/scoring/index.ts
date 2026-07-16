import {
  computeFrictionScores,
  computePersonalFriction,
  summarizeLayersUsed,
} from "@/lib/scoring/friction";
import { buildPriorities } from "@/lib/scoring/priority";
import {
  buildExecutiveReport,
  buildHrGuide,
  buildLayerDisclaimer,
  buildOrgOneLiner,
  intensityBand,
} from "@/lib/templates/executive-report";
import { buildPersonalResult } from "@/lib/templates/personal-result";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  RoleLayer,
} from "@/types/diagnosis";
import type { CalculationResult } from "@/types/report";

export interface CalculateInput {
  context: CompanyContext;
  role: RoleLayer;
  answers: Record<string, AnswerValue>;
  /** Multi-layer aggregate for org view; defaults to current role only */
  allLayers?: AnswersByLayer;
}

/**
 * Pure rule engine entrypoint (spec §6–9).
 * Pages must not invent result copy — only render this output.
 */
export function calculateResults(input: CalculateInput): CalculationResult {
  const layers: AnswersByLayer = {
    ...(input.allLayers ?? {}),
    [input.role]: input.answers,
  };

  const frictionMap = computeFrictionScores(layers, input.context);
  const personalFriction = computePersonalFriction(input.role, input.answers);
  const personalRanked = personalFriction.filter((f) => f.score > 0);
  const personalTop =
    personalRanked.length > 0 ? personalRanked : personalFriction;

  // low friction → top 2 cards only; otherwise up to 4
  const topScore = frictionMap[0]?.score ?? 0;
  const priorityCount = intensityBand(topScore) === "low" ? 2 : 4;
  const priorities = buildPriorities(frictionMap, priorityCount);

  const personal = buildPersonalResult(input.role, personalTop);
  const executiveReport = buildExecutiveReport(
    input.context,
    frictionMap,
    priorities,
  );
  const oneLiner = buildOrgOneLiner(input.context, frictionMap);
  const hrGuide = buildHrGuide(frictionMap, priorities);

  const layersUsed = summarizeLayersUsed(layers).map((l) => l.layer);
  const layerDisclaimer = buildLayerDisclaimer(layersUsed);

  return {
    personal,
    org: {
      oneLiner,
      frictionMap,
      priorities,
      executiveReport,
      hrGuide,
      layerDisclaimer,
    },
  };
}

export {
  computeFrictionScores,
  computePersonalFriction,
  buildPriorities,
  summarizeLayersUsed,
};
