"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DocsLibraryPicker } from "@/components/docs/docs-library-picker";
import { DocsNavTree } from "@/components/docs/docs-nav-tree";
import type { DocsLibraryOption } from "@/components/docs/docs-library-picker";
import type { DocNavSection } from "@/lib/docs";

type DocsMobileNavProps = {
  packageSlug: string;
  packageTitle: string;
  sections: DocNavSection[];
  libraryOptions: DocsLibraryOption[];
};

export function DocsMobileNav({
  packageSlug,
  packageTitle,
  sections,
  libraryOptions,
}: DocsMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-foreground"
      >
        <span>{packageTitle} · On this page</span>
        <Menu className="size-4 text-muted" aria-hidden />
      </button>
      {open ? (
        <div className="mt-3 space-y-4 rounded-xl border border-border bg-surface-raised p-4">
          <DocsLibraryPicker
            packageSlug={packageSlug}
            options={libraryOptions}
            className="max-w-full"
          />
          <DocsNavTree sections={sections} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
