"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AX_OWNER_OPTIONS,
  AX_STAGE_OPTIONS,
  INDUSTRY_OPTIONS,
  SIZE_OPTIONS,
} from "@/lib/constants";
import {
  DEMO_EXIT_STORAGE_KEY,
  FLASH_AFTER_DEMO_EXIT,
} from "@/lib/templates/layer-notices";
import { useDiagnosisStore } from "@/stores/diagnosis";
import { FunnelStepIndicator } from "@/components/layout/FunnelStepIndicator";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AxOwner,
  AxStage,
  CompanySize,
  Industry,
} from "@/types/diagnosis";

export default function ContextPage() {
  const router = useRouter();
  const { context, setContext } = useDiagnosisStore();
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem(DEMO_EXIT_STORAGE_KEY);
      if (msg) {
        setFlash(msg);
        sessionStorage.removeItem(DEMO_EXIT_STORAGE_KEY);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const complete =
    context.industry &&
    context.size &&
    context.axStage &&
    context.axOwner;

  return (
    <PageShell width="sm" className="space-y-4 sm:space-y-5">
      <FunnelStepIndicator current="context" />

      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-foreground sm:text-sm"
        >
          {flash || FLASH_AFTER_DEMO_EXIT}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader className="space-y-1.5 px-4 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl">
            먼저 우리 회사 상황을 알려주세요
          </CardTitle>
          <CardDescription className="text-sm">
            입력 값은 결과 해석과 우선순위에 반영됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:space-y-5 sm:px-6">
          <Field label="업종">
            <Select
              value={context.industry ?? undefined}
              onValueChange={(v) =>
                setContext({ industry: (v as Industry | null) ?? null })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="직원 규모">
            <Select
              value={context.size ?? undefined}
              onValueChange={(v) =>
                setContext({ size: (v as CompanySize | null) ?? null })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="현재 AX 진행 단계">
            <Select
              value={context.axStage ?? undefined}
              onValueChange={(v) =>
                setContext({ axStage: (v as AxStage | null) ?? null })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {AX_STAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="AX를 주로 추진하는 조직">
            <Select
              value={context.axOwner ?? undefined}
              onValueChange={(v) =>
                setContext({ axOwner: (v as AxOwner | null) ?? null })
              }
            >
              <SelectTrigger className="h-11 w-full sm:h-9">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {AX_OWNER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 px-4 pb-5 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
          <Button
            className="h-11 w-full sm:h-9 sm:w-auto"
            disabled={!complete}
            onClick={() => router.push("/role")}
          >
            다음: 역할 선택
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
