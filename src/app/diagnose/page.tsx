"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/diagnose/QuestionCard";
import { ProgressBar } from "@/components/diagnose/ProgressBar";
import { PageShell } from "@/components/layout/PageShell";
import { ROLE_LABELS } from "@/lib/constants";
import { getQuestionsForLayer } from "@/lib/questions";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { Button } from "@/components/ui/button";

export default function DiagnosePage() {
  const router = useRouter();
  const {
    role,
    answers,
    setAnswer,
    questionIndex,
    setQuestionIndex,
    computeResult,
  } = useDiagnosisStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(
    () => (role ? getQuestionsForLayer(role) : []),
    [role],
  );

  if (!role) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">역할을 먼저 선택해 주세요.</p>
        <Button
          className="mt-4 h-11 w-full sm:h-9 sm:w-auto"
          onClick={() => router.push("/role")}
        >
          역할 선택
        </Button>
      </PageShell>
    );
  }

  const q = questions[questionIndex];
  const isLast = questionIndex >= questions.length - 1;

  function finish() {
    setSubmitting(true);
    setError(null);
    try {
      computeResult();
      router.push("/result/personal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "결과 계산에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (isLast) {
      finish();
      return;
    }
    setQuestionIndex(questionIndex + 1);
  }

  if (!q) return null;

  return (
    <PageShell width="md" className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          {ROLE_LABELS[role]}
        </p>
        <ProgressBar current={questionIndex + 1} total={questions.length} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <QuestionCard
        question={q}
        index={questionIndex}
        total={questions.length}
        value={answers[q.id]}
        onChange={(v) => setAnswer(q.id, v)}
        onNext={handleNext}
        onBack={
          questionIndex > 0
            ? () => setQuestionIndex(questionIndex - 1)
            : () => router.push("/role")
        }
        isLast={isLast}
      />

      {submitting ? (
        <p className="text-center text-sm text-muted-foreground">
          결과를 계산하는 중…
        </p>
      ) : null}
    </PageShell>
  );
}
