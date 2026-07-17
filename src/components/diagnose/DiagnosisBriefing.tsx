"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { estimateDiagnoseMinutes } from "@/lib/funnel";

interface DiagnosisBriefingProps {
  questionCount: number;
  roleLabel: string;
  onStart: () => void;
  onBack: () => void;
}

/**
 * One-screen briefing before the first diagnostic item.
 * Frames measurement as structural — not person evaluation.
 */
export function DiagnosisBriefing({
  questionCount,
  roleLabel,
  onStart,
  onBack,
}: DiagnosisBriefingProps) {
  const minutes = estimateDiagnoseMinutes(questionCount);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1.5 px-4 pt-5 sm:px-6 sm:pt-6">
        <p className="text-xs font-medium text-muted-foreground">{roleLabel}</p>
        <CardTitle className="text-xl sm:text-2xl">
          구조 장벽을 측정합니다
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          개인 평가가 아니라, 조직이 AI·AX를 실행하기 어려운 구조 신호를
          읽습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <ol className="space-y-3 text-sm leading-relaxed">
          <li className="flex gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <span className="min-w-0 break-keep pt-0.5 text-foreground/90">
              개인을 평가하거나 비난하는 측정이 아닙니다.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <span className="min-w-0 break-keep pt-0.5 text-foreground/90">
              조직의 구조적 마찰(평가·역할·중간관리자·교육-업무 연결 등)을
              봅니다.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              3
            </span>
            <span className="min-w-0 break-keep pt-0.5 text-foreground/90">
              약 {minutes}분 소요 · {questionCount}문항
            </span>
          </li>
        </ol>
        <p className="text-xs text-muted-foreground">
          응답은 결과 해석에만 사용됩니다.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-2 px-4 pb-5 sm:flex-row sm:justify-between sm:px-6 sm:pb-6">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:h-9 sm:w-auto"
          onClick={onBack}
        >
          이전
        </Button>
        <Button
          type="button"
          className="h-11 w-full sm:h-9 sm:w-auto"
          onClick={onStart}
        >
          진단 시작
        </Button>
      </CardFooter>
    </Card>
  );
}
