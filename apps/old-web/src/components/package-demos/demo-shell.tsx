import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared chrome for package landing hero visualizations. */
export function DemoShell({
  live,
  badge,
  className,
  children,
}: {
  live: string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-background/90 p-4 shadow-sm backdrop-blur-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          {live}
        </p>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function DecisionBadge({
  allowed,
}: {
  allowed: boolean | null;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300",
        allowed === null
          ? "bg-muted text-muted-foreground"
          : allowed
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      )}
    >
      {allowed === null ? "…" : allowed ? "Allow" : "Deny"}
    </span>
  );
}
