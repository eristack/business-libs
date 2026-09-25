import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocMeta } from "@/lib/docs";
import { pageNavLabel } from "@/lib/doc-nav";

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
    <nav className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
        >
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted">
            <ArrowLeft className="size-3" aria-hidden />
            Previous
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {pageNavLabel(prev)}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group rounded-xl border border-border bg-surface p-4 text-right transition-colors hover:border-primary/30 sm:justify-self-end"
        >
          <p className="flex items-center justify-end gap-1 text-xs font-medium uppercase tracking-wide text-muted">
            Next
            <ArrowRight className="size-3" aria-hidden />
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {pageNavLabel(next)}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
