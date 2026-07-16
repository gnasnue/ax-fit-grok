"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FrictionScore } from "@/types/friction";
import { FRICTION_FACTORS } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FrictionMapProps {
  factors: FrictionScore[];
}

/**
 * Mobile (≤767): CSS bars only — no Recharts overflow risk, easy one-hand scan.
 * Tablet/Desktop (≥768): horizontal bar chart + full factor names.
 */
export function FrictionMap({ factors }: FrictionMapProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const shortById = Object.fromEntries(
    FRICTION_FACTORS.map((f) => [f.id, f.shortName]),
  ) as Record<string, string>;

  const sorted = [...factors].sort((a, b) => b.score - a.score);

  const chartData = sorted.map((f) => ({
    name: f.name,
    short: shortById[f.id] ?? f.name,
    score: f.score,
  }));

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="text-base sm:text-lg">Friction Map</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          구조적 장벽 점수 (0–100). 높을수록 재설계 우선순위가 높습니다.
        </CardDescription>
      </CardHeader>

      {isMobile ? (
        <CardContent className="space-y-3 px-4 pb-5">
          {sorted.map((f, i) => (
            <div key={f.id} className="min-w-0 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium leading-snug">
                  <span className="mr-1.5 text-xs text-muted-foreground">
                    #{i + 1}
                  </span>
                  {f.name}
                </p>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {f.score}
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={f.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={f.name}
              >
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-[width]",
                    f.score >= 65 && "bg-primary",
                    f.score < 40 && "opacity-70",
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {shortById[f.id] ?? f.id}
                {f.gapBonus > 0 ? ` · 갭 +${f.gapBonus}` : ""}
                {f.contextMultiplier !== 1
                  ? ` · 맥락 ×${f.contextMultiplier}`
                  : ""}
              </p>
            </div>
          ))}
        </CardContent>
      ) : (
        <CardContent className="min-w-0 px-4 pb-6 sm:px-6" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 20, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <Tooltip
                formatter={(value) => [`${value}점`, "Friction"]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar
                dataKey="score"
                fill="var(--primary)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}
