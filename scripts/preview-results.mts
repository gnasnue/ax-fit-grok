/**
 * Preview result quality for 3 sample profiles.
 * Run: npx tsx scripts/preview-results.mts
 */
import { calculateResults } from "../src/lib/scoring";
import type {
  AnswerValue,
  CompanyContext,
  RoleLayer,
} from "../src/types/diagnosis";
import type { CalculationResult } from "../src/types/report";

function dump(label: string, result: CalculationResult) {
  const { personal, org } = result;
  console.log("\n" + "=".repeat(72));
  console.log(label);
  console.log("=".repeat(72));

  console.log("\n--- 조직 한 줄 진단 ---");
  console.log(org.oneLiner);

  console.log("\n--- Friction Map (top) ---");
  org.frictionMap.forEach((f, i) => {
    console.log(
      `  ${i + 1}. ${f.id} ${f.name}: ${f.score} (base ${f.baseScore}, gap ${f.gapBonus}, ×${f.contextMultiplier})`,
    );
  });

  console.log("\n--- Work Redesign 우선순위 ---");
  org.priorities.forEach((p, i) => {
    console.log(`\n  [P${i + 1}] ${p.title} (${p.frictionId}, ${p.score}점)`);
    console.log(`  근거: ${p.rationale}`);
    console.log(`  파일럿: ${p.pilotForm}`);
    console.log(
      `  역할: HR=${p.roles.hr} | 팀장=${p.roles.manager} | IT=${p.roles.it}`,
    );
    console.log(`  지표: ${p.successMetric}`);
  });

  console.log("\n--- 경영진 리포트 ---");
  const r = org.executiveReport;
  console.log(`1. 현재 상태: ${r.headline}`);
  console.log("2. 핵심 구조적 문제:");
  r.structuralProblems.forEach((p) => console.log(`   • ${p}`));
  console.log(`3. 권고: ${r.recommendation}`);
  console.log("4. 역할 분담:");
  console.log(`   경영진: ${r.roleSplit.executive}`);
  console.log(`   HR: ${r.roleSplit.hr}`);
  console.log(`   IT: ${r.roleSplit.it}`);
  console.log(`   현업: ${r.roleSplit.business}`);
  console.log("5. 30일 액션:");
  r.next30Days.forEach((a) => {
    console.log(`   • ${a.title}`);
    console.log(`     누가/무엇: ${a.who} / ${a.what}`);
    console.log(`     기한/산출물: ${a.byWhen} / ${a.deliverable}`);
    console.log(
      `     Did: ${a.metrics.did} | Result: ${a.metrics.result} | 추적: ${a.metrics.howToTrack}`,
    );
  });

  console.log("\n--- HR 가이드 ---");
  console.log(`메시지: ${org.hrGuide.messageToExec}`);
  org.hrGuide.discussionOrder.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log(`파일럿: ${org.hrGuide.pilotSuggestion}`);

  console.log("\n--- 개인 결과 ---");
  console.log(`역할: ${personal.role}`);
  console.log(`요약: ${personal.summary}`);
  console.log("상위 마찰:");
  personal.topFrictions.forEach((f) =>
    console.log(`  • ${f.name} ${f.score}점`),
  );
  console.log("마이크로 액션:");
  personal.microActions.forEach((a) => {
    console.log(`  • ${a.title}`);
    console.log(`    ${a.who} / ${a.what} / ${a.byWhen}`);
    console.log(`    산출물: ${a.deliverable}`);
    console.log(
      `    Did: ${a.metrics.did} | Result: ${a.metrics.result}`,
    );
  });
}

// ── Sample A: High friction (manager participant) ─────────────
const highMgr: Record<string, AnswerValue> = {
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
};

const highResult = calculateResults({
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
dump("SAMPLE A — 고마찰 (팀장 단층, education_tools · 300~1000)", highResult);

// ── Sample B: Low friction ────────────────────────────────────
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

const lowResult = calculateResults({
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
dump("SAMPLE B — 저마찰 (팀장 단층, partial_apply)", lowResult);

// ── Sample C: Multi-layer + context + gaps ────────────────────
const contextC: CompanyContext = {
  industry: "manufacturing",
  size: "300_1000",
  axStage: "education_tools",
  axOwner: "hr",
};
const roleC: RoleLayer = "manager";

const layersC = {
  executive: {
    E1: 4,
    E2: "productivity" as const,
    E3: ["manager_attitude", "no_goal"] as string[],
    E4: 2,
    E5: 2,
    E6: 4,
    E7: "training" as const,
    E8: "eval" as const,
  } as Record<string, AnswerValue>,
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
  } as Record<string, AnswerValue>,
};

const multiResult = calculateResults({
  context: contextC,
  role: roleC,
  answers: highMgr,
  allLayers: layersC,
});
dump(
  "SAMPLE C — 다층+맥락+갭 (3레이어, education_tools · 300~1000 · HR)",
  multiResult,
);
