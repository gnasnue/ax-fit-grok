import type {
  AnswerValue,
  AnswersByLayer,
  FrictionFactorId,
} from "@/types/diagnosis";
import type { GapInsight } from "@/types/report";

/** Local copy to avoid circular import with friction.ts */
function scaleToFriction(answer: number, reverse: boolean | undefined): number {
  const a = Math.min(5, Math.max(1, answer));
  if (reverse) return a * 20;
  return (6 - a) * 20;
}

function avgScale(
  answers: Record<string, AnswerValue> | undefined,
  questionId: string,
): number | null {
  if (!answers) return null;
  const v = answers[questionId];
  return typeof v === "number" ? v : null;
}

function choiceId(
  answers: Record<string, AnswerValue> | undefined,
  questionId: string,
): string | null {
  if (!answers) return null;
  const v = answers[questionId];
  return typeof v === "string" ? v : null;
}

/**
 * Explicit employee–org gap insights from dedicated gap items + cross-layer pairs.
 * Used for one-liner and TOP gap problem lines (not replacing Friction 5 factors).
 */
export function computeGapInsights(layers: AnswersByLayer): GapInsight[] {
  const insights: GapInsight[] = [];

  // ── Direct gap probes ──────────────────────────────────────
  // EG1: 교육 대비 현장 변화 (순방향 — 낮을수록 갭 큼)
  const eg1 = avgScale(layers.executive, "EG1");
  if (eg1 !== null) {
    const severity = scaleToFriction(eg1, false);
    if (severity >= 40) {
      insights.push({
        id: "pace_adoption",
        area: "교육·도입 vs 현장 적용",
        factors: ["F4", "F3"],
        severity,
        problemLine:
          severity >= 65
            ? "교육·도구 도입 속도와 현장 업무 방식 변화 사이에 뚜렷한 간극이 있습니다."
            : "교육·도구 도입 대비 현장 업무 방식 변화가 아직 충분히 따라오지 못하고 있습니다.",
      });
    }
  }

  // EG2: 중간관리자 이해도 (순방향)
  const eg2 = avgScale(layers.executive, "EG2");
  if (eg2 !== null) {
    const severity = scaleToFriction(eg2, false);
    if (severity >= 40) {
      insights.push({
        id: "manager_alignment",
        area: "경영진 방향 vs 중간관리자 이해",
        factors: ["F2", "F3"],
        severity,
        problemLine:
          severity >= 65
            ? "경영진이 보는 AX 방향과, 중간관리자가 실행 가능한 수준으로 이해·번역하는 수준 사이에 간극이 큽니다."
            : "중간관리자가 회사 AX 방향을 현장 실행 언어로 옮기는 데 추가 정렬이 필요합니다.",
      });
    }
  }

  // MG1: 속도 차이 (역방향)
  const mg1 = avgScale(layers.manager, "MG1");
  if (mg1 !== null) {
    const severity = scaleToFriction(mg1, true);
    if (severity >= 40) {
      insights.push({
        id: "speed_gap",
        area: "추진 속도 vs 현장 수용 속도",
        factors: ["F2", "F3"],
        severity,
        problemLine:
          severity >= 65
            ? "회사의 추진 속도와 현장이 실제로 따라갈 수 있는 속도 사이에 뚜렷한 간극이 있습니다."
            : "윗선의 AX 기대 속도와 팀이 감당 가능한 속도에 차이가 관찰됩니다.",
      });
    }
  }

  // MG2: 메시지 vs 평가·리소스 (역방향)
  const mg2 = avgScale(layers.manager, "MG2");
  if (mg2 !== null) {
    const severity = scaleToFriction(mg2, true);
    if (severity >= 40) {
      insights.push({
        id: "message_support",
        area: "독려 메시지 vs 평가·리소스",
        factors: ["F1", "F2", "F5"],
        severity,
        problemLine:
          severity >= 65
            ? "“AI를 쓰라”는 메시지는 오지만, 평가·리소스 지원은 그대로인 구조적 불일치가 큽니다."
            : "독려 메시지 대비 평가·지원 체계의 정렬이 아직 불완전합니다.",
      });
    }
  }

  // SG1: 회사 속도 vs 업무 변화
  const sg1 = choiceId(layers.staff, "SG1");
  if (sg1 === "company_much_faster" || sg1 === "company_faster") {
    const severity = sg1 === "company_much_faster" ? 75 : 55;
    insights.push({
      id: "staff_pace",
      area: "회사 추진 vs 개인 업무 변화",
      factors: ["F3", "F4"],
      severity,
      problemLine:
        severity >= 65
          ? "실무자 기준으로 회사의 AI/AX 추진 속도가 실제 업무 변화 속도보다 훨씬 앞서 있습니다."
          : "실무자 기준으로 회사 추진 속도가 업무 변화보다 다소 빠르게 체감됩니다.",
    });
  }

  // SG2: 장려 vs 평가·지원 (순방향 — 낮을수록 갭)
  const sg2 = avgScale(layers.staff, "SG2");
  if (sg2 !== null) {
    const severity = scaleToFriction(sg2, false);
    if (severity >= 40) {
      insights.push({
        id: "encourage_vs_system",
        area: "장려 메시지 vs 평가·배분·지원",
        factors: ["F1", "F2"],
        severity,
        problemLine:
          severity >= 65
            ? "AI 활용을 장려한다고 하지만, 평가·업무 배분·지원이 따라온다는 체감은 낮은 상태입니다."
            : "장려 메시지와 실제 평가·지원 체계 사이의 연결을 더 분명히 할 여지가 있습니다.",
      });
    }
  }

  // ── Cross-layer pairs (existing structural gaps) ───────────
  const e1 = avgScale(layers.executive, "E1");
  const s9 = avgScale(layers.staff, "S9");
  if (e1 !== null && s9 !== null && Math.abs(e1 - s9) >= 1.5) {
    const severity = Math.min(100, Math.abs(e1 - s9) * 25);
    insights.push({
      id: "goal_clarity_gap",
      area: "목표 명확성 (경영진 vs 실무자)",
      factors: ["F3"],
      severity,
      problemLine:
        "경영진이 보는 목표 명확성과 실무자가 체감하는 목적 전달 수준 사이에 인식 갭이 있습니다.",
    });
  }

  // Deduplicate by id keeping highest severity, then top 2
  const byId = new Map<string, GapInsight>();
  for (const g of insights) {
    const prev = byId.get(g.id);
    if (!prev || g.severity > prev.severity) byId.set(g.id, g);
  }

  return [...byId.values()]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 4);
}

/** Extra friction bonuses from dedicated gap items (feeds F2/F3/F4 etc.) */
export function computeDirectGapBonuses(
  layers: AnswersByLayer,
): Record<FrictionFactorId, number> {
  const bonus: Record<FrictionFactorId, number> = {
    F1: 0,
    F2: 0,
    F3: 0,
    F4: 0,
    F5: 0,
  };

  // Modest additives — gap probes already feed base scores via factors
  const eg1 = avgScale(layers.executive, "EG1");
  if (eg1 !== null && eg1 <= 2) {
    bonus.F4 += 5;
    bonus.F3 += 3;
  }

  const eg2 = avgScale(layers.executive, "EG2");
  if (eg2 !== null && eg2 <= 2) {
    bonus.F2 += 5;
    bonus.F3 += 3;
  }

  const mg1 = avgScale(layers.manager, "MG1");
  if (mg1 !== null && mg1 >= 4) {
    bonus.F2 += 4;
    bonus.F3 += 4;
  }

  const mg2 = avgScale(layers.manager, "MG2");
  if (mg2 !== null && mg2 >= 4) {
    bonus.F1 += 5;
    bonus.F2 += 3;
    bonus.F5 += 3;
  }

  const sg1 = choiceId(layers.staff, "SG1");
  if (sg1 === "company_much_faster") {
    bonus.F3 += 5;
    bonus.F4 += 4;
  } else if (sg1 === "company_faster") {
    bonus.F3 += 3;
    bonus.F4 += 2;
  }

  const sg2 = avgScale(layers.staff, "SG2");
  if (sg2 !== null && sg2 <= 2) {
    bonus.F1 += 4;
    bonus.F2 += 3;
  }

  return bonus;
}
