import { NextResponse } from "next/server";
import { calculateResults } from "@/lib/scoring";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  RoleLayer,
} from "@/types/diagnosis";

export const runtime = "nodejs";

interface Body {
  context: CompanyContext;
  role: RoleLayer;
  answers: Record<string, AnswerValue>;
  allLayers?: AnswersByLayer;
}

/** Same pure rule engine as client store.computeResult() */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (!body?.role || !body?.answers || !body?.context) {
      return NextResponse.json(
        { error: "context, role, answers are required" },
        { status: 400 },
      );
    }

    const result = calculateResults({
      context: body.context,
      role: body.role,
      answers: body.answers,
      allLayers: body.allLayers,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Calculation failed" },
      { status: 500 },
    );
  }
}
