"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocMeta } from "@/lib/docs";
import { LayerBadge } from "@/components/stack/layer-badge";
import { StatusBadge } from "@/components/stack/status-badge";
import { VersionBadge } from "@/components/stack/version-badge";
import {
  categoryIndex,
  packageCategories,
  packages,
} from "@/lib/site";

type PackageReleaseSummary = {
  version: string;
  changelogHref: string;
  hasChangelog: boolean;
};

type DocsSidebarProps = {
  packageSlug: string;
  packageName: string;
  pages: DocMeta[];
  releases: Record<string, PackageReleaseSummary>;
};

function PackageSwitcher({
  packageSlug,
  releases,
}: {
  packageSlug: string;
  releases: Record<string, PackageReleaseSummary>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const current = packages.find((pkg) => pkg.slug === packageSlug)!;
  const currentRelease = releases[packageSlug];

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
        Library
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left shadow-sm",
          "transition-colors hover:border-muted-foreground/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <LayerBadge categoryId={current.category} link={false} />
            <StatusBadge status={current.status} />
            {currentRelease ? (
              <VersionBadge version={currentRelease.version} />
            ) : null}
          </div>
          <p className="truncate text-[14px] font-semibold tracking-tight text-foreground">
            {current.title}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {current.name}
          </p>
        </div>
        <ChevronsUpDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-colors",
            open && "text-foreground",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="listbox"
          aria-label="Switch documentation library"
          className="absolute top-[calc(100%+0.35rem)] left-0 z-30 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg md:w-[20.5rem]"
        >
          <div className="max-h-[min(26rem,62vh)] overflow-y-auto">
            {packageCategories.map((category, categoryIdx) => {
              const items = packages.filter(
                (pkg) => pkg.category === category.id,
              );
              if (items.length === 0) return null;
              return (
                <div
                  key={category.id}
                  className={cn(categoryIdx > 0 && "border-t border-border")}
                  data-layer={category.id}
                >
                  <div className="sticky top-0 z-10 flex items-center gap-2 bg-muted/90 px-3 py-2 backdrop-blur-sm">
                    <span
                      className="h-4 w-0.5 rounded-full bg-[color:var(--layer-accent)]"
                      aria-hidden
                    />
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {String(categoryIndex(category.id)).padStart(2, "0")}{" "}
                      {category.label}
                    </p>
                  </div>
                  <ul className="px-1.5 py-1.5">
                    {items.map((pkg) => {
                      const active = pkg.slug === packageSlug;
                      const release = releases[pkg.slug];
                      return (
                        <li key={pkg.slug}>
                          <Link
                            href={pkg.docsHref}
                            role="option"
                            aria-selected={active}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                              active
                                ? "bg-accent/10 text-foreground"
                                : "text-foreground hover:bg-muted",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-[13px] font-semibold tracking-tight">
                                  {pkg.title}
                                </p>
                                <StatusBadge status={pkg.status} />
                                {release ? (
                                  <VersionBadge version={release.version} />
                                ) : null}
                              </div>
                              <p className="truncate font-mono text-[10px] text-muted-foreground">
                                {pkg.name}
                              </p>
                            </div>
                            {active ? (
                              <Check
                                className="size-3.5 shrink-0 text-accent"
                                strokeWidth={2.5}
                              />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5 border-t border-border bg-muted/40 px-3 py-2">
            <Link
              href={current.href}
              onClick={() => setOpen(false)}
              className="block text-[11px] font-medium text-muted-foreground transition-colors hover:text-accent"
            >
              View {current.title} overview →
            </Link>
            {currentRelease ? (
              <Link
                href={currentRelease.changelogHref}
                onClick={() => setOpen(false)}
                className="block text-[11px] font-medium text-muted-foreground transition-colors hover:text-accent"
              >
                Changelog (v{currentRelease.version}) →
              </Link>
            ) : null}
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
  releases,
}: DocsSidebarProps) {
  const pathname = usePathname();
  const release = releases[packageSlug];

  return (
    <aside className="w-full shrink-0 md:w-64 lg:w-72">
      <div className="sticky top-[4.5rem] space-y-6">
        <PackageSwitcher packageSlug={packageSlug} releases={releases} />

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="font-mono text-[11px] text-muted-foreground">
              {packageName}
            </p>
            {release ? <VersionBadge version={release.version} href={release.changelogHref} /> : null}
          </div>
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

        <div className="flex flex-col gap-2 text-[13px] font-medium">
          {release ? (
            <Link
              href={release.changelogHref}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Changelog · v{release.version}
            </Link>
          ) : null}
          <Link
            href="/docs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All documentation
          </Link>
          <Link
            href="/packages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse libraries
          </Link>
        </div>
      </div>
    </aside>
  );
}
