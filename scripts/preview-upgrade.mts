/**
 * Diagnostic upgrade sample output.
 * Run: npx tsx scripts/preview-upgrade.mts
 */
import { buildDemoPayload } from "../src/lib/demo-data";
import { calculateResults } from "../src/lib/scoring";
import type { AnswersByLayer, CompanyContext } from "../src/types/diagnosis";

const demo = buildDemoPayload();

console.log("========== 1) 맥락 입력 + 갭 문항 ==========");
console.log("Respondent:", demo.respondent);
console.log("\nGap answers:");
console.log("  EG1/EG2:", demo.allLayers.executive?.EG1, demo.allLayers.executive?.EG2);
console.log("  MG1/MG2:", demo.allLayers.manager?.MG1, demo.allLayers.manager?.MG2);
console.log("  SG1/SG2:", demo.allLayers.staff?.SG1, demo.allLayers.staff?.SG2);

console.log("\n========== 2) 데모 샘플 결과 ==========");
console.log("\n[개인 한 줄 요약]");
console.log(demo.result.personal.summary);
console.log("\n[개인 마이크로 액션]");
demo.result.personal.microActions.forEach((a, i) =>
  console.log(`  ${i + 1}. ${a.title} — ${a.what}`),
);

console.log("\n[조직 한 줄 진단]");
console.log(demo.result.org.oneLiner);

console.log("\n[갭 TOP]");
demo.result.org.gapInsights.forEach((g, i) =>
  console.log(`  ${i + 1}. [${g.area}] ${g.problemLine} (sev=${g.severity})`),
);

console.log("\n[상위 Friction]");
demo.result.org.frictionMap.forEach((f, i) =>
  console.log(`  #${i + 1} ${f.id} ${f.name}: ${f.score}`),
);

console.log("\n[우선순위]");
demo.result.org.priorities.forEach((p, i) =>
  console.log(`  P${i + 1} ${p.title} (${p.score})`),
);

console.log("\n[권고]");
console.log(demo.result.org.executiveReport.recommendation);

console.log("\n[구조적 문제]");
demo.result.org.executiveReport.structuralProblems.forEach((p, i) =>
  console.log(`  ${i + 1}. ${p}`),
);

// High-friction synthetic single-layer manager for contrast
console.log("\n========== 고마찰 샘플 (팀장 only) ==========");
const highCtx: CompanyContext = {
  industry: "manufacturing",
  size: "300_1000",
  axStage: "education_tools",
  axOwner: "hr",
};
const highAnswers = {
  M1: 1,
  M2: "eval",
  M3: 1,
  M4: 5,
  M5: 1,
  M6: 1,
  M7: 1,
  M8: 1,
  M9: 5,
  M10: "guide",
  MG1: 5,
  MG2: 5,
};
const highLayers: AnswersByLayer = { manager: highAnswers };
const high = calculateResults({
  context: highCtx,
  role: "manager",
  answers: highAnswers,
  allLayers: highLayers,
  respondent: {
    jobFunction: "sales",
    tenure: "7_15",
    aiLevel: "frequent",
  },
});
console.log("[개인]", high.personal.summary);
console.log("[조직]", high.org.oneLiner);
console.log(
  "[Friction]",
  high.org.frictionMap.map((f) => `${f.id}:${f.score}`).join(" "),
);
console.log(
  "[갭]",
  high.org.gapInsights.map((g) => g.problemLine).join(" | "),
);
console.log("[권고]", high.org.executiveReport.recommendation);
