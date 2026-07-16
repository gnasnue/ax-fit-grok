import type { ExecutiveReport as ExecReport } from "@/types/report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionList } from "@/components/result/ActionList";

interface ExecutiveReportProps {
  report: ExecReport;
  onDownloadPdf?: () => void;
}

export function ExecutiveReportView({
  report,
  onDownloadPdf,
}: ExecutiveReportProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 px-4 pt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:pt-6">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base sm:text-lg">
            경영진용 한 장 리포트
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            회의 자료로 바로 쓸 수 있는 요약
          </CardDescription>
        </div>
        {onDownloadPdf ? (
          <button
            type="button"
            onClick={onDownloadPdf}
            className="h-11 w-full shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted sm:h-auto sm:w-auto"
          >
            PDF 다운로드
          </button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-5 text-sm sm:space-y-5 sm:px-6 sm:pb-6">
        <section>
          <h3 className="mb-1 font-semibold">1. 현재 상태</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {report.headline}
          </p>
        </section>
        <Separator />
        <section>
          <h3 className="mb-2 font-semibold">2. 핵심 구조적 문제</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {report.structuralProblems.map((p) => (
              <li key={p} className="leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        </section>
        <Separator />
        <section>
          <h3 className="mb-1 font-semibold">3. 권고 방향</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {report.recommendation}
          </p>
        </section>
        <Separator />
        <section>
          <h3 className="mb-2 font-semibold">4. 역할 분담</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
            <div>
              <dt className="font-medium">경영진</dt>
              <dd className="text-sm text-muted-foreground">
                {report.roleSplit.executive}
              </dd>
            </div>
            <div>
              <dt className="font-medium">HR</dt>
              <dd className="text-sm text-muted-foreground">
                {report.roleSplit.hr}
              </dd>
            </div>
            <div>
              <dt className="font-medium">IT·데이터</dt>
              <dd className="text-sm text-muted-foreground">
                {report.roleSplit.it}
              </dd>
            </div>
            <div>
              <dt className="font-medium">현업</dt>
              <dd className="text-sm text-muted-foreground">
                {report.roleSplit.business}
              </dd>
            </div>
          </dl>
        </section>
        <Separator />
        <section>
          <h3 className="mb-2 font-semibold">5. 다음 30일 액션</h3>
          <ActionList actions={report.next30Days} />
        </section>
      </CardContent>
    </Card>
  );
}
