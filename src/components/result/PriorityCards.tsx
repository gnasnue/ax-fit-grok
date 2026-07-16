import type { PriorityCard } from "@/types/report";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PriorityCardsProps {
  items: PriorityCard[];
}

/**
 * Mobile: 1 col, compact copy, break long lines.
 * Tablet (≥768): 2 col grid — less cramped than full-width stacks.
 * Desktop: same 2 col within max-w-5xl shell.
 */
export function PriorityCards({ items }: PriorityCardsProps) {
  return (
    <section className="min-w-0 space-y-3 sm:space-y-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold sm:text-xl">
          「업무 재설계」 우선순위
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          교육을 더하기 전에 구조를 손볼 영역입니다.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <Card key={item.id} className="min-w-0 overflow-hidden">
            <CardHeader className="space-y-2 px-4 pt-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary">P{i + 1}</Badge>
                <Badge variant="outline" className="tabular-nums">
                  {item.score}점
                </Badge>
              </div>
              <CardTitle className="text-base leading-snug break-keep sm:text-lg">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed break-keep sm:text-sm">
                {item.rationale}
              </CardDescription>
            </CardHeader>

            <CardContent className="min-w-0 space-y-3 px-4 pb-4 text-sm sm:px-5 sm:pb-5 md:px-6 md:pb-6">
              <div className="min-w-0">
                <p className="text-sm font-medium">추천 파일럿</p>
                <p className="mt-0.5 text-xs leading-relaxed break-keep text-muted-foreground sm:text-sm">
                  {item.pilotForm}
                </p>
              </div>

              {/* Mobile: labeled rows that wrap cleanly */}
              <div className="min-w-0 space-y-2 rounded-md bg-muted/40 p-2.5 text-xs sm:text-sm">
                <p className="font-medium">역할 분담</p>
                <div className="grid gap-1.5">
                  <RoleLine label="HR" text={item.roles.hr} />
                  <RoleLine label="팀장" text={item.roles.manager} />
                  <RoleLine label="IT" text={item.roles.it} />
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium">성공 지표</p>
                <p className="mt-0.5 text-xs leading-relaxed break-keep text-muted-foreground sm:text-sm">
                  {item.successMetric}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RoleLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[2.5rem_1fr] gap-2 sm:grid-cols-[3rem_1fr]">
      <span className="shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="min-w-0 break-keep text-foreground/90">{text}</span>
    </div>
  );
}
