"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DemoBanner } from "@/components/result/DemoBanner";
import { PersonalSummary } from "@/components/result/PersonalSummary";
import { buttonVariants } from "@/components/ui/button";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { cn } from "@/lib/utils";

export default function PersonalResultPage() {
  const router = useRouter();
  const result = useDiagnosisStore((s) => s.result);
  const isDemo = useDiagnosisStore((s) => s.isDemoSession);

  if (!result) {
    return (
      <PageShell width="sm" className="text-center">
        <p className="text-muted-foreground">진단 결과가 없습니다.</p>
        <Link
          href="/context"
          className={cn(
            buttonVariants(),
            "mt-4 inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          진단 시작
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell width="md" className="space-y-6 sm:space-y-8">
      <DemoBanner variant="personal" />

      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          개인 결과
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {isDemo
            ? "데모 참여자(중간관리자) 응답 기준 요약입니다. 이어서 조직 전체 결과를 확인하세요."
            : "나의 응답 기준 요약입니다. 조직 결과는 레이어·맥락을 반영합니다."}
        </p>
      </div>

      <PersonalSummary result={result.personal} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        {!isDemo ? (
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full sm:h-9 sm:w-auto",
            )}
            onClick={() => router.push("/diagnose")}
          >
            응답 다시 보기
          </button>
        ) : null}
        <Link
          href="/result/org"
          className={cn(
            buttonVariants(),
            "inline-flex h-11 w-full justify-center sm:h-9 sm:w-auto",
          )}
        >
          조직 전체 결과 보기
        </Link>
      </div>
    </PageShell>
  );
}
