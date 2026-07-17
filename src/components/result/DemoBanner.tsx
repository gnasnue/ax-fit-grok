"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { buttonVariants } from "@/components/ui/button";
import {
  DEMO_EXIT_STORAGE_KEY,
  DEMO_QUALITY_CAVEAT,
  DEMO_SAMPLE_NOTICE,
  FLASH_AFTER_DEMO_EXIT,
} from "@/lib/templates/layer-notices";
import { cn } from "@/lib/utils";

type DemoBannerVariant = "personal" | "org";

/**
 * Shown only during demo session — links personal ↔ org results.
 * “직접 진단 시작” fully clears demo state before entering /context.
 */
export function DemoBanner({ variant }: { variant: DemoBannerVariant }) {
  const router = useRouter();
  const isDemo = useDiagnosisStore((s) => s.isDemoSession);
  const meta = useDiagnosisStore((s) => s.demoMeta);
  const startRealDiagnosis = useDiagnosisStore((s) => s.startRealDiagnosis);

  if (!isDemo || !meta) return null;

  function handleStartReal() {
    startRealDiagnosis();
    try {
      sessionStorage.setItem(DEMO_EXIT_STORAGE_KEY, FLASH_AFTER_DEMO_EXIT);
    } catch {
      /* ignore */
    }
    router.push("/context");
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 sm:px-4">
      <p className="text-xs font-medium text-primary sm:text-sm">데모 시나리오</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug">{meta.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {meta.blurb}
      </p>
      <p className="mt-2 text-xs font-medium leading-relaxed text-foreground/90 sm:text-sm">
        {DEMO_SAMPLE_NOTICE}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
        {DEMO_QUALITY_CAVEAT}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {variant === "personal" ? (
          <Link
            href="/result/org"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-10 w-full justify-center sm:h-8 sm:w-auto",
            )}
          >
            조직 전체 결과 보기
          </Link>
        ) : (
          <Link
            href="/result/personal"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-10 w-full justify-center sm:h-8 sm:w-auto",
            )}
          >
            개인 결과 (팀장 관점) 보기
          </Link>
        )}
        <button
          type="button"
          onClick={handleStartReal}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 w-full justify-center sm:h-8 sm:w-auto",
          )}
        >
          직접 진단 시작
        </button>
      </div>
    </div>
  );
}
