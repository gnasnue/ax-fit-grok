/**
 * One-liner quality review samples.
 * Run: npx tsx scripts/preview-oneliners.mts
 */
import { buildDemoPayload } from "../src/lib/demo-data";
import { calculateResults } from "../src/lib/scoring";
import type { AnswerValue } from "../src/types/diagnosis";

function show(label: string, r: ReturnType<typeof calculateResults>) {
  console.log(`===== ${label} =====`);
  console.log(r.org.oneLiner);
  console.log(
    "top:",
    r.org.frictionMap
      .slice(0, 3)
      .map((f) => `${f.id}:${f.name}:${f.score}`)
      .join(" | "),
  );
  console.log(
    "gaps:",
    (r.org.gapInsights ?? [])
      .map((g) => `${g.severity}:${g.area}`)
      .join(" || ") || "(none)",
  );
  console.log("len:", r.org.oneLiner.length);
  console.log("");
}

const demo = buildDemoPayload();
show("1) 데모 데이터", demo.result);

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
const high = calculateResults({
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
show("2) 고마찰 (팀장 only · education_tools)", high);

const highMulti = calculateResults({
  context: {
    industry: "manufacturing",
    size: "300_1000",
    axStage: "education_tools",
    axOwner: "hr",
  },
  role: "manager",
  answers: highMgr,
  allLayers: {
    executive: {
      E1: 4,
      E2: "productivity",
      E3: ["manager_attitude", "no_goal"],
      E4: 2,
      E5: 2,
      E6: 4,
      E7: "training",
      E8: "eval",
      EG1: 2,
      EG2: 2,
    },
    manager: highMgr,
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
      SG1: "company_much_faster",
      SG2: 2,
    },
  },
});
show("2b) 고마찰 (3레이어 · education_tools)", highMulti);

const lowMgr: Record<string, AnswerValue> = {
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
const low = calculateResults({
  context: {
    industry: "it_platform",
    size: "1000_2000",
    axStage: "partial_apply",
    axOwner: "tft",
  },
  role: "manager",
  answers: lowMgr,
  allLayers: { manager: lowMgr },
});
show("3) 저마찰 (팀장 only · partial_apply)", low);

const lowMulti = calculateResults({
  context: {
    industry: "it_platform",
    size: "1000_2000",
    axStage: "partial_apply",
    axOwner: "tft",
  },
  role: "manager",
  answers: lowMgr,
  allLayers: {
    executive: {
      E1: 5,
      E2: "productivity",
      E3: ["process"],
      E4: 4,
      E5: 4,
      E6: 4,
      E7: "business",
      E8: "process",
      EG1: 4,
      EG2: 4,
    },
    manager: lowMgr,
    staff: {
      S1: 4,
      S2: "howto",
      S3: 4,
      S4: 4,
      S5: 4,
      S6: 2,
      S7: 2,
      S8: "none",
      S9: 4,
      S10: "support",
      SG1: "aligned",
      SG2: 4,
    },
  },
});
show("3b) 저마찰 (3레이어 · partial_apply)", lowMulti);
