import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t py-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-1 px-4 text-center text-xs text-muted-foreground sm:px-6 sm:text-sm">
        <p className="text-balance">
          {APP_NAME} — 중견기업 HR을 위한 AX 조직 마찰 진단 · 업무 재설계
        </p>
        <p>구조적 장벽을 먼저, 교육은 그 다음.</p>
      </div>
    </footer>
  );
}
