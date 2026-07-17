"use client";

import { useRouter } from "next/navigation";
import {
  AI_LEVEL_OPTIONS,
  JOB_FUNCTION_OPTIONS,
  TENURE_OPTIONS,
} from "@/lib/constants";
import { useDiagnosisStore } from "@/stores/diagnosis";
import type {
  AiProficiency,
  JobFunction,
  TenureBand,
} from "@/types/diagnosis";
import { FunnelStepIndicator } from "@/components/layout/FunnelStepIndicator";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RespondentPage() {
  const router = useRouter();
  const { role, respondent, setRespondent } = useDiagnosisStore();

  if (!role) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">역할을 먼저 선택해 주세요.</p>
        <Button
          className="mt-4 h-11 w-full sm:h-9 sm:w-auto"
          onClick={() => router.push("/role")}
        >
          역할 선택으로
        </Button>
      </PageShell>
    );
  }

  const complete =
    respondent.jobFunction && respondent.tenure && respondent.aiLevel;

  return (
    <PageShell width="sm" className="space-y-4 sm:space-y-5">
      <FunnelStepIndicator current="respondent" />
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1.5 px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl">
            본인 업무 맥락을 알려주세요
          </CardTitle>
          <CardDescription className="text-sm">
            직무·연차·AI 활용 수준은 개인 결과 해석과 마이크로 액션에
            반영됩니다. (3문항)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:space-y-5 sm:px-6">
          <Field label="주요 직무/업무 영역">
            <Select
              value={respondent.jobFunction ?? undefined}
              onValueChange={(v) =>
                setRespondent({
                  jobFunction: (v as JobFunction | null) ?? null,
                })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {JOB_FUNCTION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="해당 업무 연차">
            <Select
              value={respondent.tenure ?? undefined}
              onValueChange={(v) =>
                setRespondent({
                  tenure: (v as TenureBand | null) ?? null,
                })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {TENURE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="본인 AI 활용 수준">
            <Select
              value={respondent.aiLevel ?? undefined}
              onValueChange={(v) =>
                setRespondent({
                  aiLevel: (v as AiProficiency | null) ?? null,
                })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {AI_LEVEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-between sm:pt-4">
            <Button
              variant="outline"
              className="h-11 w-full sm:h-9 sm:w-auto"
              onClick={() => router.push("/role")}
            >
              이전
            </Button>
            <Button
              className="h-11 w-full sm:h-9 sm:w-auto"
              disabled={!complete}
              onClick={() => router.push("/diagnose")}
            >
              다음: 진단 안내
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
