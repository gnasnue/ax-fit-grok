"use client";

import type { ActionItem } from "@/types/report";
import { Checkbox } from "@/components/ui/checkbox";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { cn } from "@/lib/utils";

interface MicroActionChecklistProps {
  actions: ActionItem[];
}

/**
 * Personal-result only: micro-action checklist with local completion state.
 * Does not affect org results or executive action lists.
 */
export function MicroActionChecklist({ actions }: MicroActionChecklistProps) {
  const checks = useDiagnosisStore((s) => s.personalActionChecks);
  const toggle = useDiagnosisStore((s) => s.togglePersonalAction);

  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">액션이 없습니다.</p>;
  }

  const completed = actions.filter((a) => checks[a.id]).length;
  const total = actions.length;

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-sm font-medium tabular-nums">
        완료한 액션{" "}
        <span className="text-primary">{completed}</span>개
        <span className="font-normal text-muted-foreground">
          {" "}
          / 전체 {total}개
        </span>
      </p>

      <ul className="space-y-2.5 sm:space-y-3">
        {actions.map((a) => {
          const done = Boolean(checks[a.id]);
          return (
            <li
              key={a.id}
              className={cn(
                "rounded-lg border p-3 text-sm transition-colors sm:p-4",
                done && "border-primary/30 bg-primary/5",
              )}
            >
              <label className="flex cursor-pointer items-start gap-3 touch-manipulation">
                <Checkbox
                  checked={done}
                  onCheckedChange={() => toggle(a.id)}
                  className="mt-0.5 size-5 sm:size-4"
                  aria-label={`${a.title} 완료 여부`}
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p
                    className={cn(
                      "font-semibold leading-snug",
                      done && "text-muted-foreground line-through",
                    )}
                  >
                    {a.title}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-muted-foreground",
                      done && "line-through opacity-70",
                    )}
                  >
                    <span className="font-medium text-foreground">누가</span>{" "}
                    {a.who}
                    {" · "}
                    <span className="font-medium text-foreground">무엇을</span>{" "}
                    {a.what}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-muted-foreground",
                      done && "line-through opacity-70",
                    )}
                  >
                    <span className="font-medium text-foreground">기한</span>{" "}
                    {a.byWhen}
                    {" · "}
                    <span className="font-medium text-foreground">산출물</span>{" "}
                    {a.deliverable}
                  </p>
                  <div
                    className={cn(
                      "mt-2 grid gap-1 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground",
                      done && "opacity-60",
                    )}
                  >
                    <p>
                      <span className="font-medium text-foreground">Did</span>{" "}
                      {a.metrics.did}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Result</span>{" "}
                      {a.metrics.result}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">추적</span>{" "}
                      {a.metrics.howToTrack}
                    </p>
                  </div>
                  {done ? (
                    <p className="mt-2 text-xs font-medium text-primary">
                      완료됨
                    </p>
                  ) : null}
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
