import { writeFileSync } from "node:fs";
import { calculateResults } from "../src/lib/scoring";

const highMgr = {
  M1: 1,
  M2: "time",
  M3: 1,
  M4: 5,
  M5: 1,
  M6: 1,
  M7: 1,
  M8: 1,
  M9: 5,
  M10: "metrics",
} as const;

const lowMgr = {
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
} as const;

const ctxMfg = {
  industry: "manufacturing" as const,
  size: "300_1000" as const,
  axStage: "education_tools" as const,
  axOwner: "hr" as const,
};

const A = calculateResults({
  context: ctxMfg,
  role: "manager",
  answers: { ...highMgr },
  allLayers: { manager: { ...highMgr } },
});

const B = calculateResults({
  context: {
    industry: "it_platform",
    size: "1000_2000",
    axStage: "partial_apply",
    axOwner: "tft",
  },
  role: "manager",
  answers: { ...lowMgr },
  allLayers: { manager: { ...lowMgr } },
});

const C = calculateResults({
  context: ctxMfg,
  role: "manager",
  answers: { ...highMgr },
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
    },
    manager: { ...highMgr },
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
  },
});

function dump(title: string, r: ReturnType<typeof calculateResults>) {
  return [
    `## ${title}`,
    `oneLiner: ${r.org.oneLiner}`,
    `disclaimer: ${r.org.layerDisclaimer ?? "(없음 — 다층)"}`,
    `priorityCount: ${r.org.priorities.length}`,
    ...r.org.priorities.map(
      (p, i) => `  P${i + 1}: ${p.title} (${p.score})`,
    ),
    `hrMsg: ${r.org.hrGuide.messageToExec}`,
    `hrDiscuss2: ${r.org.hrGuide.discussionOrder[1]}`,
    "problems:",
    ...r.org.executiveReport.structuralProblems.map((p) => `  - ${p}`),
    `recommendation: ${r.org.executiveReport.recommendation}`,
    `personal: ${r.personal.summary}`,
    `actions: ${r.personal.microActions.map((a) => a.title).join(", ")}`,
    "",
  ].join("\n");
}

const out = [
  dump("A 고마찰 · 단층 · 제조", A),
  dump("B 저마찰 · 단층 · IT·플랫폼", B),
  dump("C 다층+맥락+갭 · 제조", C),
].join("\n");

writeFileSync(new URL("./preview-utf8.md", import.meta.url), out, "utf8");
console.log(out);
