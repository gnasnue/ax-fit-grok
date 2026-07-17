import {
  computeFrictionScores,
  computePersonalFriction,
  summarizeLayersUsed,
} from "@/lib/scoring/friction";
import { computeGapInsights } from "@/lib/scoring/gaps";
import { buildPriorities } from "@/lib/scoring/priority";
import { computeRolePerceptionGaps } from "@/lib/scoring/role-perception";
import {
  buildExecutiveReport,
  buildHrGuide,
  buildLayerDisclaimer,
  buildOrgOneLiner,
  intensityBand,
} from "@/lib/templates/executive-report";
import { buildOrgActionCards } from "@/lib/templates/org-actions";
import { buildPersonalResult } from "@/lib/templates/personal-result";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  RespondentContext,
  RoleLayer,
} from "@/types/diagnosis";
import type { CalculationResult } from "@/types/report";

export interface CalculateInput {
  context: CompanyContext;
  role: RoleLayer;
  answers: Record<string, AnswerValue>;
  /** Multi-layer aggregate for org view; defaults to current role only */
  allLayers?: AnswersByLayer;
  /** Respondent job/tenure/AI level — personal result only */
  respondent?: RespondentContext | null;
}

/**
 * Pure rule engine entrypoint (spec §6–9 + respondent/gap extensions).
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

  const gapInsights = computeGapInsights(layers);
  const topGaps = gapInsights.slice(0, 2);

  const topScore = frictionMap[0]?.score ?? 0;
  const priorityCount = intensityBand(topScore) === "low" ? 2 : 4;
  const priorities = buildPriorities(frictionMap, priorityCount);
  const actionCards = buildOrgActionCards(frictionMap, topGaps);
  const rolePerceptionGaps = computeRolePerceptionGaps(layers, frictionMap);

  const layersUsed = summarizeLayersUsed(layers).map((l) => l.layer);
  const layerCount = layersUsed.length;
  const singleLayer = layerCount <= 1;
  const layerDisclaimer = buildLayerDisclaimer(layersUsed);

  const personal = buildPersonalResult(
    input.role,
    personalTop,
    input.respondent ?? null,
  );
  const executiveReport = buildExecutiveReport(
    input.context,
    frictionMap,
    priorities,
    topGaps,
    { singleLayer },
  );
  const oneLiner = buildOrgOneLiner(input.context, frictionMap, topGaps, {
    singleLayer,
  });
  const hrGuide = buildHrGuide(frictionMap, priorities, topGaps);

  return {
    personal,
    org: {
      oneLiner,
      frictionMap,
      priorities,
      actionCards,
      rolePerceptionGaps,
      executiveReport,
      hrGuide,
      gapInsights: topGaps,
      layerCount,
      layerDisclaimer,
    },
  };
}

export {
  computeFrictionScores,
  computePersonalFriction,
  buildPriorities,
  summarizeLayersUsed,
  computeGapInsights,
  computeRolePerceptionGaps,
  buildOrgActionCards,
};
