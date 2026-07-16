import type { ActionItem } from "@/types/report";

interface ActionListProps {
  actions: ActionItem[];
}

export function ActionList({ actions }: ActionListProps) {
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">액션이 없습니다.</p>;
  }

  return (
    <ul className="min-w-0 space-y-3 sm:space-y-4">
      {actions.map((a) => (
        <li
          key={a.id}
          className="min-w-0 overflow-hidden rounded-lg border p-3 text-sm sm:p-4"
        >
          <p className="font-semibold leading-snug break-keep">{a.title}</p>
          <p className="mt-1 text-xs leading-relaxed break-keep text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground">누가</span> {a.who}
            {" · "}
            <span className="font-medium text-foreground">무엇을</span> {a.what}
          </p>
          <p className="mt-1 text-xs leading-relaxed break-keep text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground">기한</span> {a.byWhen}
            {" · "}
            <span className="font-medium text-foreground">산출물</span>{" "}
            {a.deliverable}
          </p>
          <div className="mt-2 grid min-w-0 gap-1 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            <p className="break-keep">
              <span className="font-medium text-foreground">Did</span>{" "}
              {a.metrics.did}
            </p>
            <p className="break-keep">
              <span className="font-medium text-foreground">Result</span>{" "}
              {a.metrics.result}
            </p>
            <p className="break-keep">
              <span className="font-medium text-foreground">추적</span>{" "}
              {a.metrics.howToTrack}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
