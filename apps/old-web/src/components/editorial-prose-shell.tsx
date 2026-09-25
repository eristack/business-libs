import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EditorialProseShellProps = {
  children: ReactNode;
  className?: string;
  meta?: ReactNode;
};

/** Shared article surface — docs, changelog, blog prose. */
export function EditorialProseShell({
  children,
  className,
  meta,
}: EditorialProseShellProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/80 bg-card px-6 py-7 shadow-[0_1px_2px_rgba(26,24,20,0.04)] sm:px-8 sm:py-8",
        className,
      )}
    >
      {meta ? (
        <div className="mb-6 border-b border-border/60 pb-4">{meta}</div>
      ) : null}
      <div className="prose-measure">{children}</div>
    </article>
  );
}
