"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import { DocsPackageSwitcher } from "@/components/docs/docs-package-switcher";
import type { DocNavSection } from "@/lib/docs";

type DocsMobileNavProps = {
  packageSlug: string;
  packageTitle: string;
  sections: DocNavSection[];
};

export function DocsMobileNav({
  packageSlug,
  packageTitle,
  sections,
}: DocsMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground"
      >
        <span>{packageTitle} · Pages</span>
        <Menu className="size-4 text-muted" aria-hidden />
      </button>
      {open ? (
        <div className="mt-3 space-y-4 rounded-xl border border-border bg-surface-raised p-4">
          <DocsPackageSwitcher packageSlug={packageSlug} />
          <DocsNavTree sections={sections} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
