import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import { DocsPackageSwitcher } from "@/components/docs/docs-package-switcher";
import type { DocNavSection } from "@/lib/docs";
import { getPackageRelease } from "@/lib/package-meta";
import { getCategory, packages } from "@/lib/site";

type DocsSidebarProps = {
  packageSlug: string;
  sections: DocNavSection[];
};

export function DocsSidebar({ packageSlug, sections }: DocsSidebarProps) {
  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const category = getCategory(pkg.category);
  const release = getPackageRelease(pkg);

  return (
    <aside className="flex h-full flex-col gap-6">
      <Link
        href="/docs"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All libraries
      </Link>

      <DocsPackageSwitcher packageSlug={packageSlug} />

      <div className="rounded-xl border border-border bg-surface px-3 py-3">
        <p className="text-xs font-medium text-primary">{category?.label}</p>
        <p className="mt-1 font-mono text-[11px] text-muted">{pkg.name}</p>
        <p className="mt-2 font-mono text-xs text-muted">v{release.version}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <DocsNavTree sections={sections} />
      </div>
    </aside>
  );
}
