"use client";

import type { PersonalResult } from "@/types/report";
import { ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MicroActionChecklist } from "@/components/result/MicroActionChecklist";

interface PersonalSummaryProps {
  result: PersonalResult;
}

export function PersonalSummary({ result }: PersonalSummaryProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <Badge variant="secondary" className="w-fit">
            {ROLE_LABELS[result.role]}
          </Badge>
          <CardTitle className="text-lg sm:text-xl">나의 진단 요약</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-foreground/80 sm:text-base">
            {result.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            내가 느낀 주요 마찰 요인
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4 pb-5 sm:px-6 sm:pb-6">
          {result.topFrictions.map((f) => (
            <Badge
              key={f.id}
              variant="outline"
              className="px-2.5 py-1 text-xs sm:px-3 sm:text-sm"
            >
              {f.name} · {f.score}점
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            바로 적용 가능한 마이크로 액션
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            부담이 낮은 즉시 실행 항목 · 체크하면 이 브라우저에 저장됩니다
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
          <MicroActionChecklist actions={result.microActions} />
        </CardContent>
      </Card>
    </div>
  );
}
