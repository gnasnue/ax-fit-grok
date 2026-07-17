/**
 * Action card quality review.
 * Run: npx tsx scripts/preview-action-cards.mts
 */
import { buildDemoPayload } from "../src/lib/demo-data";

const d = buildDemoPayload();
const cards = d.result.org.actionCards;
const hr = cards.filter((c) => c.audience === "hr");
const exec = cards.filter((c) => c.audience === "executive");

function dump(label: string, list: typeof cards) {
  console.log(`\n########## ${label} ##########`);
  for (const c of list) {
    console.log(`\n--- ${c.priority} ---`);
    console.log(`우선순위: ${c.priority}`);
    console.log(`연결 Friction: ${c.frictionLabel}`);
    console.log(`제목: ${c.title}`);
    console.log(`왜 지금인가: ${c.whyNow}`);
    console.log(`누가: ${c.who}`);
    console.log(`언제까지: ${c.byWhen}`);
    console.log(`성공 지표:`);
    c.successMetrics.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    console.log(`다음 액션: ${c.nextAction}`);
  }
}

console.log("=== top friction ===");
d.result.org.frictionMap.slice(0, 4).forEach((f, i) =>
  console.log(`  #${i + 1} ${f.id} ${f.name}: ${f.score}`),
);
console.log("=== gap insights ===");
d.result.org.gapInsights.forEach((g) =>
  console.log(`  [${g.factors.join(",")}] ${g.problemLine}`),
);

dump("HR이 할 일", hr);
dump("경영진에 요청할 일", exec);
