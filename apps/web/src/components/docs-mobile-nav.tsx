"use client";

import { ListTree } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DocNavSection } from "@/lib/docs";
import { DocsNavTree } from "@/components/docs-nav-tree";
import { packages } from "@/lib/site";

type DocsMobileNavProps = {
  packageSlug: string;
  packageName: string;
  sections: DocNavSection[];
};

export function DocsMobileNav({
  packageSlug,
  packageName,
  sections,
}: DocsMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pkg = packages.find((item) => item.slug === packageSlug);

  return (
    <div className="no-print mb-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-full justify-start gap-2">
            <ListTree className="size-4 shrink-0 opacity-70" />
            <span className="truncate text-[13px]">{packageName} · Contents</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left text-base">Documentation</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {pkg ? (
              <div
                className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                data-layer={pkg.category}
              >
                <p className="text-[13px] font-semibold tracking-tight text-foreground">
                  {pkg.title}
                </p>
                <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                  {pkg.name}
                </p>
              </div>
            ) : null}
            <DocsNavTree
              sections={sections}
              layerId={pkg?.category}
              onNavigate={() => setOpen(false)}
              className="px-1"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
