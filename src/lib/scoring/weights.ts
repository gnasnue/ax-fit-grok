import type { CompanyContext, FrictionFactorId, RoleLayer } from "@/types/diagnosis";
import { LAYER_WEIGHTS } from "@/lib/constants";

export function getLayerWeight(layer: RoleLayer): number {
  return LAYER_WEIGHTS[layer];
}

/**
 * Spec §6.5 — company context multipliers per friction factor.
 * Final score = min(100, (base + gap) * multiplier)
 */
export function getContextMultipliers(
  context: CompanyContext,
): Record<FrictionFactorId, number> {
  const m: Record<FrictionFactorId, number> = {
    F1: 1,
    F2: 1,
    F3: 1,
    F4: 1,
    F5: 1,
  };

  // ax_stage = education_tools → F1, F2 ×1.15
  if (context.axStage === "education_tools") {
    m.F1 *= 1.15;
    m.F2 *= 1.15;
  }

  // ax_stage = partial_apply → F3, F4 ×1.12
  if (context.axStage === "partial_apply") {
    m.F3 *= 1.12;
    m.F4 *= 1.12;
  }

  // size = 300~2000 → F2 ×1.10
  if (context.size === "300_1000" || context.size === "1000_2000") {
    m.F2 *= 1.1;
  }

  // Extended context rules (spec: "기타 규칙은 이전 상세 문서 참고")
  if (context.axStage === "enterprise_rollout") {
    m.F1 *= 1.08;
    m.F3 *= 1.08;
  }
  if (context.size === "under_300") {
    m.F5 *= 1.08;
  }
  if (context.axOwner === "it") {
    m.F3 *= 1.05;
  }
  if (context.axOwner === "hr") {
    m.F1 *= 1.05;
  }

  return m;
}

export function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}
