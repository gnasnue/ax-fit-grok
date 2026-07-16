"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildDemoPayload } from "@/lib/demo-data";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { PageShell } from "@/components/layout/PageShell";

/**
 * /demo — no live diagnosis.
 * Loads 3-layer mid-size manufacturing sample → personal result first,
 * with banner linking to full org results (and back).
 */
export default function DemoPage() {
  const router = useRouter();
  const loadDemo = useDiagnosisStore((s) => s.loadDemo);
  const [blurb, setBlurb] = useState("데모 결과를 준비하는 중…");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const payload = buildDemoPayload();
    setTitle(payload.meta.title);
    setBlurb(payload.meta.blurb);
    loadDemo({
      context: payload.context,
      respondent: payload.respondent,
      role: payload.role,
      answers: payload.answers,
      allLayers: payload.allLayers,
      result: payload.result,
      meta: payload.meta,
    });

    const t = window.setTimeout(() => {
      // Personal first (팀장 관점) → banner → 조직 결과
      router.replace("/result/personal");
    }, 1000);

    return () => window.clearTimeout(t);
  }, [loadDemo, router]);

  return (
    <PageShell
      width="sm"
      className="flex flex-col items-center py-16 text-center sm:py-24"
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Demo
      </p>
      {title ? (
        <h1 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h1>
      ) : null}
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {blurb}
      </p>
      <p className="mt-2 max-w-sm text-xs text-muted-foreground">
        개인 결과(팀장) → 조직 결과 순으로 확인할 수 있습니다.
      </p>
      <p className="mt-6 text-xs text-muted-foreground animate-pulse">
        개인 결과로 이동 중…
      </p>
    </PageShell>
  );
}
