import type { GapInsight } from "@/types/report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GapInsightsProps {
  items: GapInsight[];
}

/** Renders TOP employee–org gap problem lines (copy from scoring/templates only) */
export function GapInsightsPanel({ items }: GapInsightsProps) {
  if (!items.length) return null;

  return (
    <Card className="overflow-hidden border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
      <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-base sm:text-lg">
          직원–조직 갭 TOP {Math.min(2, items.length)}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          추진 속도와 현장 체감 사이의 간극 — 교육 확대보다 구조 재설계 단서
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
        <ol className="space-y-3">
          {items.slice(0, 2).map((g, i) => (
            <li
              key={g.id}
              className="rounded-lg border bg-background/80 px-3 py-3 sm:px-4"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {i + 1}. {g.area}
              </p>
              <p className="mt-1 text-sm leading-relaxed break-keep">
                {g.problemLine}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
