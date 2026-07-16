/**
 * Sample-response verification for Friction scoring (spec §6).
 * Run: npx tsx scripts/verify-friction.mts
 */
import { getQuestionsByFriction, QUESTIONS } from "../src/lib/questions";
import {
  computeFrictionScores,
  computeGapBonuses,
  layerFrictionFromAnswers,
  scaleToFriction,
} from "../src/lib/scoring/friction";
import type { AnswersByLayer, CompanyContext } from "../src/types/diagnosis";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

console.log("\n=== 1. Scale conversion (§6.2) ===");
assert(scaleToFriction(1, false) === 100, "순방향 answer=1 → 100");
assert(scaleToFriction(5, false) === 20, "순방향 answer=5 → 20");
assert(scaleToFriction(3, false) === 60, "순방향 answer=3 → 60");
assert(scaleToFriction(1, true) === 20, "역방향 answer=1 → 20");
assert(scaleToFriction(5, true) === 100, "역방향 answer=5 → 100");
assert(scaleToFriction(3, true) === 60, "역방향 answer=3 → 60");

console.log("\n=== 2. Question inventory ===");
const byLayer = {
  executive: QUESTIONS.filter((q) => q.layer === "executive").length,
  manager: QUESTIONS.filter((q) => q.layer === "manager").length,
  staff: QUESTIONS.filter((q) => q.layer === "staff").length,
};
assert(byLayer.executive === 8, "경영진 8문항");
assert(byLayer.manager === 10, "중간관리자 10문항");
assert(byLayer.staff === 10, "실무자 10문항");

const reverseIds = QUESTIONS.filter((q) => q.reverse).map((q) => q.id);
assert(
  reverseIds.sort().join(",") === "M4,M9,S6",
  `역방향 문항 = M4,M9,S6 (got ${reverseIds.join(",")})`,
);

const byF = getQuestionsByFriction();
console.log("\n=== 3. Friction → questions map ===");
for (const [f, ids] of Object.entries(byF)) {
  console.log(`  ${f}: ${ids.join(", ")}`);
  assert(ids.length >= 3, `${f} has ≥3 linked questions`);
}

console.log("\n=== 4. Layer means — high-friction sample (manager only) ===");
const highManager = {
  M1: 1, // 순방향 → 100 F4/F5
  M2: "time", // F5:65
  M3: 1, // 100 F3/F4
  M4: 5, // 역방향 → 100 F2
  M5: 1, // 100 F1
  M6: 1, // 100 F1
  M7: 1, // 100 F4
  M8: 1, // 100 F4
  M9: 5, // 역방향 → 100 F2/F3
  M10: "metrics", // F1:55
};
const { means } = layerFrictionFromAnswers("manager", highManager);
console.log("  means:", means);
assert(means.F1 >= 80, `F1 high (got ${means.F1})`);
assert(means.F2 >= 90, `F2 high (got ${means.F2})`);
assert(means.F4 >= 90, `F4 high (got ${means.F4})`);
assert(means.F5 >= 70, `F5 high (got ${means.F5})`);

console.log("\n=== 5. Layer means — low-friction sample (manager) ===");
const lowManager = {
  M1: 5,
  M2: "howto",
  M3: 5,
  M4: 1,
  M5: 5,
  M6: 5,
  M7: 5,
  M8: 5,
  M9: 1,
  M10: "tools",
};
const low = layerFrictionFromAnswers("manager", lowManager);
console.log("  means:", low.means);
assert(low.means.F1 <= 30, `F1 low (got ${low.means.F1})`);
assert(low.means.F2 <= 30, `F2 low (got ${low.means.F2})`);

console.log("\n=== 6. Gap bonuses (§6.4) ===");
const gapLayers: AnswersByLayer = {
  executive: { E1: 5, E6: 5 },
  manager: { M4: 5, M5: 5 }, // burden high → proxy 1; support self 5
  staff: { S9: 2, S5: 2 },
};
const gaps = computeGapBonuses(gapLayers);
console.log("  gaps:", gaps);
// |5-2|=3 ≥1.5 → F3+12
assert(gaps.F3 === 12, `F3 gap +12 (got ${gaps.F3})`);
// |5 - (6-5)| = |5-1| = 4 ≥1.5 → F2+15
// |5-2|=3 ≥1.5 → F2+10 → total F2 = 25
assert(gaps.F2 === 25, `F2 gap +15+10=25 (got ${gaps.F2})`);

console.log("\n=== 7. Full org score with context (§6.3–6.5) ===");
const context: CompanyContext = {
  industry: "manufacturing",
  size: "300_1000", // F2 ×1.10
  axStage: "education_tools", // F1,F2 ×1.15
  axOwner: "hr", // F1 ×1.05
};

const layers: AnswersByLayer = {
  executive: {
    E1: 4,
    E2: "productivity",
    E3: ["manager_attitude", "no_goal"],
    E4: 2,
    E5: 2,
    E6: 4,
    E7: "training",
    E8: "eval",
  },
  manager: highManager,
  staff: {
    S1: 2,
    S2: "howto",
    S3: 2,
    S4: 2,
    S5: 2,
    S6: 4,
    S7: 3,
    S8: "time",
    S9: 2,
    S10: "eval",
  },
};

const scores = computeFrictionScores(layers, context);
console.log("\n  Final friction scores (sorted):");
for (const s of scores) {
  console.log(
    `  ${s.id} ${s.name}: score=${s.score} base=${s.baseScore} gap=${s.gapBonus} mult=${s.contextMultiplier}`,
  );
}

const f1 = scores.find((s) => s.id === "F1")!;
const f2 = scores.find((s) => s.id === "F2")!;
const f3 = scores.find((s) => s.id === "F3")!;

// Context multipliers
assert(
  Math.abs(f1.contextMultiplier - 1.15 * 1.05) < 0.001,
  `F1 mult = 1.15*1.05 = 1.2075 (got ${f1.contextMultiplier})`,
);
assert(
  Math.abs(f2.contextMultiplier - 1.15 * 1.1) < 0.001,
  `F2 mult = 1.15*1.10 = 1.265 (got ${f2.contextMultiplier})`,
);

// Gaps expected: E1=4 vs S9=2 → F3+12; E6=4 vs M4=5 proxy=1 → |4-1|=3 → F2+15; M5=1 vs S5=2 → |1-2|=1 <1.5 no +10
assert(f3.gapBonus === 12, `F3 gap 12 (got ${f3.gapBonus})`);
assert(f2.gapBonus === 15, `F2 gap 15 only (got ${f2.gapBonus})`);

// High friction overall — top scores should be elevated
assert(f2.score >= 70, `F2 final ≥70 under high sample (got ${f2.score})`);
assert(f1.score >= 60, `F1 final ≥60 (got ${f1.score})`);
assert(scores.every((s) => s.score <= 100), "all scores ≤100");

// Layer weights applied: manager 1.3 > exec 0.75 — high manager F2 should dominate
console.log("\n=== 8. Weight check — manager-heavy F2 ===");
const execOnlyF2 = layerFrictionFromAnswers("executive", {
  E6: 5, // 20 friction only
});
const mgrOnlyF2 = layerFrictionFromAnswers("manager", {
  M4: 5, // 100
});
assert(execOnlyF2.means.F2 === 20, "exec E6=5 → F2=20");
assert(mgrOnlyF2.means.F2 === 100, "mgr M4=5 reverse → F2=100");

const mixed = computeFrictionScores(
  {
    executive: { E6: 5 },
    manager: { M4: 5 },
  },
  {
    industry: null,
    size: null,
    axStage: null,
    axOwner: null,
  },
);
const mixedF2 = mixed.find((s) => s.id === "F2")!;
// weighted: (20*0.75 + 100*1.3) / (0.75+1.3) = (15+130)/2.05 ≈ 70.73
const expected = (20 * 0.75 + 100 * 1.3) / (0.75 + 1.3);
assert(
  Math.abs(mixedF2.baseScore - Math.round(expected * 10) / 10) < 0.2,
  `F2 weighted base ≈ ${expected.toFixed(1)} (got ${mixedF2.baseScore})`,
);

console.log("\n✅ All friction mapping checks passed.\n");
