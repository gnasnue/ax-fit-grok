import { buildDemoPayload } from "../src/lib/demo-data";
import { calculateResults } from "../src/lib/scoring";
import type { AnswerValue } from "../src/types/diagnosis";

const demo = buildDemoPayload();
console.log("=== DEMO 3-layer ===");
console.log("layerCount:", demo.result.org.layerCount);
console.log("disclaimer:", demo.result.org.layerDisclaimer);
console.log("oneLiner:", demo.result.org.oneLiner);
console.log("");

const highMgr: Record<string, AnswerValue> = {
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
const single = calculateResults({
  context: {
    industry: "manufacturing",
    size: "300_1000",
    axStage: "education_tools",
    axOwner: "hr",
  },
  role: "manager",
  answers: highMgr,
  allLayers: { manager: highMgr },
});
console.log("=== SINGLE layer ===");
console.log("layerCount:", single.org.layerCount);
console.log("disclaimer:", single.org.layerDisclaimer);
console.log("oneLiner:", single.org.oneLiner);
