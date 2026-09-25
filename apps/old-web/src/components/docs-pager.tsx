import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

type DocsPagerProps = {
  pages: DocMeta[];
  currentSlug: string;
};

export function DocsPager({ pages, currentSlug }: DocsPagerProps) {
  const index = pages.findIndex((page) => page.slug === currentSlug);
  if (index === -1) return null;

  const prev = index > 0 ? pages[index - 1] : null;
  const next = index < pages.length - 1 ? pages[index + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="mt-14 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/40"
        >
          <p className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight">
            {prev.slug === "index" ? "Overview" : prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group rounded-lg border border-border bg-card p-4 text-right transition-colors hover:border-muted-foreground/40 sm:justify-self-end sm:text-right"
        >
          <p className="flex items-center justify-end gap-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Next
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight">
            {next.slug === "index" ? "Overview" : next.title}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
