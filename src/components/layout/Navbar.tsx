import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 px-4 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-baseline gap-0.5 text-sm font-semibold tracking-tight sm:text-base"
        >
          <span className="text-primary">AX</span>
          <span>Fit</span>
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "px-2 text-xs sm:px-2.5 sm:text-sm",
            )}
          >
            <span className="sm:hidden">데모</span>
            <span className="hidden sm:inline">데모 결과</span>
          </Link>
          <Link
            href="/context"
            className={cn(
              buttonVariants({ size: "sm" }),
              "px-2.5 text-xs sm:px-3 sm:text-sm",
            )}
          >
            <span className="sm:hidden">시작</span>
            <span className="hidden sm:inline">진단 시작</span>
          </Link>
        </nav>
      </div>
      <span className="sr-only">{APP_NAME}</span>
    </header>
  );
}
