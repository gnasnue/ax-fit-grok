import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <PageShell width="lg" className="flex flex-col gap-8 sm:gap-10 md:py-16">
      <div className="space-y-4 text-center sm:space-y-6 md:text-left">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
          AX Friction Diagnostic
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-5xl md:leading-tight">
          교육을 더 시키는 대신,
          <br />
          <span className="text-primary">왜 안 바뀌는지부터</span> 진단하세요
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0">
          중견기업 HR이 경영진의 AX 지시를 실행 가능한 과제로 바꾸고, 조직 마찰을
          데이터로 보여주며, 부서 간 책임을 나눌 수 있게 하는 근거 기반 도구입니다.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
        <Link
          href="/context"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full justify-center sm:h-10 sm:w-auto",
          )}
        >
          조직 진단 시작하기
        </Link>
        <Link
          href="/demo"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 w-full justify-center sm:h-10 sm:w-auto",
          )}
        >
          데모 결과 보기
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 text-left text-sm text-muted-foreground sm:grid-cols-3 sm:gap-4">
        <li className="rounded-xl border p-3.5 sm:p-4">
          <p className="font-medium text-foreground">3-레이어 진단</p>
          <p className="mt-1 text-xs sm:text-sm">경영진 · 중간관리자 · 실무자</p>
        </li>
        <li className="rounded-xl border p-3.5 sm:p-4">
          <p className="font-medium text-foreground">Friction Map</p>
          <p className="mt-1 text-xs sm:text-sm">구조적 장벽을 점수로 시각화</p>
        </li>
        <li className="rounded-xl border p-3.5 sm:p-4">
          <p className="font-medium text-foreground">경영진 한 장 리포트</p>
          <p className="mt-1 text-xs sm:text-sm">회의 자료 + PDF 다운로드</p>
        </li>
      </ul>
    </PageShell>
  );
}
