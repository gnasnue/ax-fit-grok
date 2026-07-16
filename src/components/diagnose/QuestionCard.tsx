"use client";

import { ScaleInput } from "@/components/diagnose/ScaleInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AnswerValue, Question } from "@/types/diagnosis";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  value?: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  onNext,
  onBack,
  isLast,
}: QuestionCardProps) {
  const canProceed = (() => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.length > 0;
    return true;
  })();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-1.5 px-4 pt-5 sm:px-6 sm:pt-6">
        <CardDescription className="text-xs sm:text-sm">
          문항 {index + 1} / {total}
        </CardDescription>
        <CardTitle className="text-base leading-snug text-balance sm:text-xl">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {question.type === "scale" ? (
          <ScaleInput
            value={typeof value === "number" ? value : undefined}
            onChange={onChange}
          />
        ) : null}

        {question.type === "single" && question.options ? (
          <RadioGroup
            value={typeof value === "string" ? value : ""}
            onValueChange={onChange}
            className="gap-2 sm:gap-3"
          >
            {question.options.map((opt) => (
              <Label
                key={opt.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm sm:min-h-0",
                  "touch-manipulation",
                  value === opt.id && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value={opt.id} />
                <span className="leading-snug">{opt.label}</span>
              </Label>
            ))}
          </RadioGroup>
        ) : null}

        {question.type === "multi" && question.options ? (
          <div className="space-y-2 sm:space-y-3">
            {question.options.map((opt) => {
              const selected = Array.isArray(value) ? value : [];
              const checked = selected.includes(opt.id);
              return (
                <Label
                  key={opt.id}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm sm:min-h-0",
                    "touch-manipulation",
                    checked && "border-primary bg-primary/5",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = new Set(selected);
                      if (c) {
                        if (
                          question.maxSelect &&
                          next.size >= question.maxSelect &&
                          !next.has(opt.id)
                        ) {
                          return;
                        }
                        next.add(opt.id);
                      } else {
                        next.delete(opt.id);
                      }
                      onChange(Array.from(next));
                    }}
                  />
                  <span className="leading-snug">{opt.label}</span>
                </Label>
              );
            })}
            {question.maxSelect ? (
              <p className="text-xs text-muted-foreground">
                최대 {question.maxSelect}개까지 선택
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-2 px-4 pb-5 sm:flex-row sm:justify-between sm:px-6 sm:pb-6">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:h-9 sm:w-auto"
          onClick={onBack}
          disabled={!onBack}
        >
          이전
        </Button>
        <Button
          type="button"
          className="h-11 w-full sm:h-9 sm:w-auto"
          onClick={onNext}
          disabled={!canProceed}
        >
          {isLast ? "결과 보기" : "다음"}
        </Button>
      </CardFooter>
    </Card>
  );
}
