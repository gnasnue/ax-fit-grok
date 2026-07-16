import type { FrictionFactorId, RoleLayer } from "./diagnosis";

export interface FrictionFactorMeta {
  id: FrictionFactorId;
  name: string;
  shortName: string;
  description: string;
}

/** Single friction factor after weights, gap, context (0–100) */
export interface FrictionScore {
  id: FrictionFactorId;
  name: string;
  score: number;
  baseScore: number;
  gapBonus: number;
  contextMultiplier: number;
}

export interface LayerContribution {
  layer: RoleLayer;
  weight: number;
  answeredCount: number;
}

export interface FrictionMapResult {
  factors: FrictionScore[];
  topFactors: FrictionScore[];
  layersUsed: LayerContribution[];
}
