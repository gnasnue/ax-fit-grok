import type { HrGuide } from "@/types/report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Presentational only — all copy from templates via HrGuide */
export function HrGuidePanel({ guide }: { guide: HrGuide }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-base sm:text-lg">HR 활용 가이드</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          경영진 미팅 전에 이렇게 준비하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-5 text-sm sm:px-6 sm:pb-6">
        <div>
          <p className="font-medium">경영진에게 이렇게 이야기하세요</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {guide.messageToExec}
          </p>
        </div>
        <div>
          <p className="mb-1 font-medium">내부 논의 순서</p>
          <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed text-muted-foreground">
            {guide.discussionOrder.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <p className="font-medium">작은 파일럿 위치</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {guide.pilotSuggestion}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
