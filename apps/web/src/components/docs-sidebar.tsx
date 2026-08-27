"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, ChevronsUpDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocNavSection } from "@/lib/docs";
import { DocsNavTree } from "@/components/docs-nav-tree";
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
  sections: DocNavSection[];
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
    <div ref={rootRef} className="relative" data-layer={current.category}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex w-full overflow-hidden rounded-lg border border-border/60 bg-card/70 text-left shadow-[0_1px_2px_rgba(26,24,20,0.03)] backdrop-blur-sm",
          "transition-[border-color,background-color,box-shadow] duration-150",
          "hover:border-border hover:bg-card hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open && "border-border bg-card shadow-sm",
        )}
      >
        <span
          className="w-[3px] shrink-0 self-stretch bg-[color:var(--layer-accent)]"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
              {current.title}
            </p>
            <p className="mt-0.5 truncate font-mono text-[10.5px] text-muted-foreground">
              {current.name}
              {currentRelease ? (
                <span className="text-muted-foreground/70">
                  {" "}
                  · v{currentRelease.version}
                </span>
              ) : null}
            </p>
          </div>
          <ChevronsUpDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-muted-foreground",
              open && "text-foreground",
            )}
            aria-hidden
          />
        </div>
      </button>

      {open ? (
        <div
          id={panelId}
          role="listbox"
          aria-label="Switch documentation library"
          className="absolute top-[calc(100%+0.4rem)] left-0 z-30 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md md:w-[20.5rem]"
        >
          <div className="docs-sidebar-scroll max-h-[min(26rem,62vh)] overflow-y-auto">
            {packageCategories.map((category, categoryIdx) => {
              const items = packages.filter(
                (pkg) => pkg.category === category.id,
              );
              if (items.length === 0) return null;
              return (
                <div
                  key={category.id}
                  className={cn(categoryIdx > 0 && "border-t border-border/60")}
                  data-layer={category.id}
                >
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/40 bg-muted/80 px-3 py-2 backdrop-blur-md">
                    <span
                      className="h-3.5 w-0.5 rounded-full bg-[color:var(--layer-accent)]"
                      aria-hidden
                    />
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {String(categoryIndex(category.id)).padStart(2, "0")}{" "}
                      {category.label}
                    </p>
                  </div>
                  <ul className="p-1.5">
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
                              "flex items-center gap-2 rounded-md px-2.5 py-2 transition-colors",
                              active
                                ? "bg-accent/8 text-foreground ring-1 ring-accent/12"
                                : "text-foreground hover:bg-muted/80",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-[13px] font-medium tracking-tight">
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
          <div className="space-y-1 border-t border-border/60 bg-muted/30 px-3 py-2.5">
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

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof BookOpen;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
    >
      <Icon
        className="size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-80"
        aria-hidden
      />
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function DocsSidebar({
  packageSlug,
  sections,
  releases,
}: DocsSidebarProps) {
  const current = packages.find((pkg) => pkg.slug === packageSlug)!;
  const release = releases[packageSlug];

  return (
    <aside className="hidden w-full shrink-0 md:block md:w-[15.5rem] lg:w-[16.5rem]">
      <div className="sticky top-[3.75rem] flex max-h-[calc(100svh-4.25rem)] flex-col gap-4">
        <PackageSwitcher packageSlug={packageSlug} releases={releases} />

        <div
          data-layer={current.category}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/50 bg-card/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:bg-card/20 dark:shadow-none"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Contents
            </p>
            {release ? (
              <VersionBadge
                version={release.version}
                href={release.changelogHref}
              />
            ) : null}
          </div>

          <div className="docs-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
            <DocsNavTree
              sections={sections}
              layerId={current.category}
            />
          </div>
        </div>

        <nav
          aria-label="Documentation shortcuts"
          className="shrink-0 space-y-0.5 border-t border-border/45 pt-3"
        >
          {release ? (
            <SidebarLink href={release.changelogHref} icon={History}>
              Changelog · v{release.version}
            </SidebarLink>
          ) : null}
          <SidebarLink href="/docs" icon={ArrowLeft}>
            All documentation
          </SidebarLink>
          <SidebarLink href="/packages" icon={BookOpen}>
            Browse libraries
          </SidebarLink>
        </nav>
      </div>
    </aside>
  );
}
