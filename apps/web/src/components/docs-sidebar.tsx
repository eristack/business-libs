"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocMeta } from "@/lib/docs";
import { packageCategories, packages } from "@/lib/site";

type DocsSidebarProps = {
  packageSlug: string;
  packageName: string;
  pages: DocMeta[];
};

function PackageSwitcher({ packageSlug }: { packageSlug: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const current = packages.find((pkg) => pkg.slug === packageSlug)!;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Package
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-foreground/15 bg-foreground px-3 py-2.5 text-left text-background",
          "shadow-sm transition-colors",
          "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight">
            {current.title}
          </p>
          <p className="truncate font-mono text-[11px] text-background/60">
            {current.name}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-background/20 bg-background/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-background/80 tabular-nums">
          {packages.length}
        </span>
        <ChevronsUpDown
          className={cn(
            "size-4 shrink-0 text-background/55 transition-colors",
            open && "text-background",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="listbox"
          aria-label="Switch documentation package"
          className="absolute top-[calc(100%+0.4rem)] left-0 z-30 w-full min-w-[16.5rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:w-[19rem] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="border-b border-border bg-muted/60 px-3 py-2">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Switch package
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              Primitive → capability → service → AI
            </p>
          </div>

          <div className="max-h-[min(22rem,55vh)] overflow-y-auto py-1">
            {packageCategories.map((category) => {
              const items = packages.filter(
                (pkg) => pkg.category === category.id,
              );
              if (items.length === 0) return null;
              return (
                <div key={category.id} className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {category.label}
                  </p>
                  {items.map((pkg) => {
                    const active = pkg.slug === packageSlug;
                    return (
                      <Link
                        key={pkg.slug}
                        href={pkg.href}
                        role="option"
                        aria-selected={active}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-start gap-2.5 px-3 py-2 transition-colors",
                          active
                            ? "bg-foreground text-background"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="text-[13px] font-semibold tracking-tight">
                              {pkg.title}
                            </p>
                            <p
                              className={cn(
                                "truncate font-mono text-[10px]",
                                active
                                  ? "text-background/60"
                                  : "text-muted-foreground",
                              )}
                            >
                              {pkg.name}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "mt-0.5 line-clamp-2 text-[11px] leading-4",
                              active
                                ? "text-background/60"
                                : "text-muted-foreground",
                            )}
                          >
                            {pkg.description}
                          </p>
                        </div>
                        {active ? (
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DocsSidebar({
  packageSlug,
  packageName,
  pages,
}: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-64 lg:w-72">
      <div className="sticky top-[4.5rem] space-y-6">
        <PackageSwitcher packageSlug={packageSlug} />

        <div>
          <p className="mb-2 font-mono text-[11px] text-muted-foreground">
            {packageName}
          </p>
          <nav className="flex flex-col rounded-xl border border-border bg-card py-2 shadow-sm">
            {pages.map((page, index) => {
              const active = pathname === page.href;
              return (
                <Link
                  key={page.slug}
                  href={page.href}
                  className={cn(
                    "group flex items-baseline gap-3 py-1.5 pr-3 pl-3 text-[13px] transition-colors",
                    active
                      ? "bg-accent/10 font-medium text-foreground dark:bg-accent/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 font-mono text-[10px] tabular-nums",
                      active ? "text-accent" : "text-muted-foreground/70",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 truncate">
                    {page.slug === "index" ? "Overview" : page.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/docs"
          className="inline-block text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All documentation
        </Link>
      </div>
    </aside>
  );
}
