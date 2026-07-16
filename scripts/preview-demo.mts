/**
 * Demo quality gates for /demo.
 * Run: npx tsx scripts/preview-demo.mts
 */
import { buildDemoPayload } from "../src/lib/demo-data";
import { computeGapBonuses } from "../src/lib/scoring/friction";

const demo = buildDemoPayload();
const gaps = computeGapBonuses(demo.allLayers);
const map = demo.result.org.frictionMap;
const byId = Object.fromEntries(map.map((f) => [f.id, f]));

console.log("=== Meta / Context ===");
console.log(demo.meta.title);
console.log(demo.context);
console.log("layers:", Object.keys(demo.allLayers));
console.log("role:", demo.role);
console.log("disclaimer:", demo.result.org.layerDisclaimer ?? "(none)");

console.log("\n=== Gaps ===");
console.log(gaps);

console.log("\n=== Friction (sorted) ===");
map.forEach((f, i) => {
  console.log(
    `  #${i + 1} ${f.id} ${f.name}: ${f.score}  base=${f.baseScore} gap=${f.gapBonus} ×${f.contextMultiplier}`,
  );
});

const top3 = map.slice(0, 3);
const scores = map.map((f) => f.score);
const spread = Math.max(...scores) - Math.min(...scores);
const gap12 = top3[0].score - top3[1].score;
const gap23 = top3[1].score - top3[2].score;

console.log("\n=== One-liner ===");
console.log(demo.result.org.oneLiner);

console.log("\n=== Priorities ===");
demo.result.org.priorities.forEach((p, i) =>
  console.log(`  P${i + 1} ${p.title} (${p.score})`),
);

console.log("\n=== Gates ===");
const layers = ["executive", "manager", "staff"] as const;
const allLayers =
  layers.every((l) => demo.allLayers[l] && Object.keys(demo.allLayers[l]!).length > 0);
console.log(allLayers ? "✓ 3 layers present" : "✗ missing layer");
console.log(
  !demo.result.org.layerDisclaimer
    ? "✓ no single-layer disclaimer"
    : "✗ single-layer disclaimer",
);
console.log(
  demo.context.axStage === "education_tools" &&
    demo.context.size === "300_1000" &&
    demo.context.axOwner === "hr"
    ? "✓ realistic mid-size context"
    : "✗ context off",
);
console.log(
  gaps.F2 >= 15 && gaps.F3 >= 12
    ? `✓ gaps F2=${gaps.F2} F3=${gaps.F3}`
    : `✗ gaps weak ${JSON.stringify(gaps)}`,
);
console.log(
  map[0].score < 100
    ? `✓ top factor not maxed (${map[0].score})`
    : "✗ top factor capped at 100 (too one-sided)",
);
console.log(
  spread >= 15
    ? `✓ map spread ${spread.toFixed(1)}`
    : `✗ flat map spread ${spread.toFixed(1)}`,
);
console.log(
  gap12 >= 3 || gap23 >= 3
    ? `✓ top-3 separation #1-#2=${gap12.toFixed(1)} #2-#3=${gap23.toFixed(1)}`
    : `✗ top-3 too close`,
);

// Prefer classic education-tools story: F2 / F1 / F4 among top 3
const topIds = new Set(top3.map((f) => f.id));
const storyHit = ["F2", "F1", "F4"].filter((id) => topIds.has(id as "F2")).length;
// fix type
const storyIds = ["F2", "F1", "F4"] as const;
const storyCount = storyIds.filter((id) => topIds.has(id)).length;
console.log(
  storyCount >= 2
    ? `✓ education-tools story factors in top3 (${[...topIds].join(", ")})`
    : `✗ unexpected top3 ${[...topIds].join(", ")}`,
);

console.log("\nF1", byId.F1?.score, "F2", byId.F2?.score, "F4", byId.F4?.score);
