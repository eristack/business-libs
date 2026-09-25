import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DocsLibraryPicker } from "@/components/docs/docs-library-picker";
import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import type { DocsLibraryOption } from "@/components/docs/docs-library-picker";
import type { DocNavSection } from "@/lib/docs";
import { getPackageRelease } from "@/lib/package-meta";
import { getCategory, packages } from "@/lib/site";

type DocsSidebarProps = {
  packageSlug: string;
  sections: DocNavSection[];
  libraryOptions: DocsLibraryOption[];
};

export function DocsSidebar({
  packageSlug,
  sections,
  libraryOptions,
}: DocsSidebarProps) {
  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const category = getCategory(pkg.category);
  const release = getPackageRelease(pkg);

  return (
    <aside className="flex max-h-[calc(100dvh-6rem)] min-w-0 flex-col gap-4">
      <Link
        href="/docs"
        className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All libraries
      </Link>

      <div className="relative z-20 min-w-0 shrink-0">
        <DocsLibraryPicker packageSlug={packageSlug} options={libraryOptions} />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface px-3 py-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-primary">{category?.label}</p>
          <p className="font-mono text-[10px] text-muted">v{release.version}</p>
        </div>
        <a
          href={release.npmHref}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] font-medium text-primary hover:underline"
        >
          npm
        </a>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="shrink-0 border-b border-border bg-surface-raised/80 px-3 py-2.5">
          <p className="text-[10px] font-bold tracking-[0.12em] text-foreground/80 uppercase">
            Contents
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2.5 [-webkit-overflow-scrolling:touch]">
          <DocsNavTree sections={sections} />
        </div>
      </div>
    </aside>
  );
}
