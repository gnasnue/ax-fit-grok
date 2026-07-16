"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateResults } from "@/lib/scoring";
import type {
  AnswerValue,
  AnswersByLayer,
  CompanyContext,
  RespondentContext,
  RoleLayer,
} from "@/types/diagnosis";
import type { CalculationResult } from "@/types/report";
import type { DemoScenarioMeta } from "@/lib/demo-data";

const emptyContext = (): CompanyContext => ({
  industry: null,
  size: null,
  axStage: null,
  axOwner: null,
});

const emptyRespondent = (): RespondentContext => ({
  jobFunction: null,
  tenure: null,
  aiLevel: null,
});

interface DiagnosisState {
  context: CompanyContext;
  respondent: RespondentContext;
  role: RoleLayer | null;
  answers: Record<string, AnswerValue>;
  allLayers: AnswersByLayer;
  result: CalculationResult | null;
  questionIndex: number;
  /**
   * Personal micro-action completion (local only).
   * Key = ActionItem.id, value = completed.
   * Persisted to localStorage via zustand persist — org results untouched.
   */
  personalActionChecks: Record<string, boolean>;
  /** True when session was loaded from /demo */
  isDemoSession: boolean;
  demoMeta: DemoScenarioMeta | null;

  setContext: (partial: Partial<CompanyContext>) => void;
  setRespondent: (partial: Partial<RespondentContext>) => void;
  setRole: (role: RoleLayer) => void;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  setQuestionIndex: (index: number) => void;
  setResult: (result: CalculationResult | null) => void;
  /**
   * Run pure rule engine (lib/scoring + lib/templates).
   * Prefer this for client-side consistency; API mirrors the same function.
   */
  computeResult: () => CalculationResult;
  loadDemo: (payload: {
    context: CompanyContext;
    respondent?: RespondentContext;
    role: RoleLayer;
    answers: Record<string, AnswerValue>;
    allLayers?: AnswersByLayer;
    result: CalculationResult;
    meta?: DemoScenarioMeta;
  }) => void;
  clearDemoSession: () => void;
  togglePersonalAction: (actionId: string) => void;
  setPersonalActionDone: (actionId: string, done: boolean) => void;
  resetAnswers: () => void;
  resetAll: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      context: emptyContext(),
      respondent: emptyRespondent(),
      role: null,
      answers: {},
      allLayers: {},
      result: null,
      questionIndex: 0,
      personalActionChecks: {},
      isDemoSession: false,
      demoMeta: null,

      setContext: (partial) =>
        set((s) => ({
          context: { ...s.context, ...partial },
          isDemoSession: false,
          demoMeta: null,
        })),

      setRespondent: (partial) =>
        set((s) => ({
          respondent: { ...s.respondent, ...partial },
          isDemoSession: false,
          demoMeta: null,
        })),

      setRole: (role) =>
        set({
          role,
          answers: {},
          questionIndex: 0,
          result: null,
          // New role → new action set; clear personal checklist
          personalActionChecks: {},
          isDemoSession: false,
          demoMeta: null,
        }),

      setAnswer: (questionId, value) => {
        const { role, answers, allLayers } = get();
        const nextAnswers = { ...answers, [questionId]: value };
        const nextLayers = role
          ? { ...allLayers, [role]: nextAnswers }
          : allLayers;
        set({ answers: nextAnswers, allLayers: nextLayers });
      },

      setQuestionIndex: (index) => set({ questionIndex: index }),

      setResult: (result) => set({ result }),

      computeResult: () => {
        const { context, respondent, role, answers, allLayers } = get();
        if (!role) {
          throw new Error("역할이 선택되지 않았습니다.");
        }
        const result = calculateResults({
          context,
          role,
          answers,
          allLayers,
          respondent,
        });
        set({ result, isDemoSession: false, demoMeta: null });
        return result;
      },

      loadDemo: (payload) =>
        set({
          context: payload.context,
          respondent: payload.respondent ?? emptyRespondent(),
          role: payload.role,
          answers: payload.answers,
          allLayers: payload.allLayers ?? {
            [payload.role]: payload.answers,
          },
          result: payload.result,
          questionIndex: 0,
          personalActionChecks: {},
          isDemoSession: true,
          demoMeta: payload.meta ?? null,
        }),

      clearDemoSession: () =>
        set({ isDemoSession: false, demoMeta: null }),

      togglePersonalAction: (actionId) =>
        set((s) => ({
          personalActionChecks: {
            ...s.personalActionChecks,
            [actionId]: !s.personalActionChecks[actionId],
          },
        })),

      setPersonalActionDone: (actionId, done) =>
        set((s) => ({
          personalActionChecks: {
            ...s.personalActionChecks,
            [actionId]: done,
          },
        })),

      resetAnswers: () =>
        set({
          answers: {},
          questionIndex: 0,
          result: null,
          personalActionChecks: {},
          isDemoSession: false,
          demoMeta: null,
        }),

      resetAll: () =>
        set({
          context: emptyContext(),
          respondent: emptyRespondent(),
          role: null,
          answers: {},
          allLayers: {},
          result: null,
          questionIndex: 0,
          personalActionChecks: {},
          isDemoSession: false,
          demoMeta: null,
        }),
    }),
    {
      name: "ax-fit-diagnosis",
      partialize: (s) => ({
        context: s.context,
        respondent: s.respondent,
        role: s.role,
        answers: s.answers,
        allLayers: s.allLayers,
        result: s.result,
        personalActionChecks: s.personalActionChecks,
        isDemoSession: s.isDemoSession,
        demoMeta: s.demoMeta,
      }),
    },
  ),
);
