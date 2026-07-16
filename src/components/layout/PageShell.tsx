import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  /** max-w-* class, default max-w-3xl */
  width?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const widthClass = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  /** Org results on desktop — wider content, still ~1024 cap so 1280 isn’t sparse */
  "2xl": "max-w-5xl",
} as const;

/** Consistent horizontal padding + vertical rhythm across breakpoints */
export function PageShell({
  children,
  width = "lg",
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10",
        widthClass[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
