"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/stack/status-badge";
import { cn } from "@/lib/utils";
import {
  categoryIndex,
  isLibrariesNavActive,
  packageCategories,
  packagesByCategory,
  type PackageCategoryId,
} from "@/lib/site";

function layerFromPath(pathname: string): PackageCategoryId | null {
  for (const category of packageCategories) {
    if (pathname === category.href || pathname.startsWith(`${category.href}/`)) {
      return category.id;
    }
  }
  const grouped = packagesByCategory();
  for (const layer of grouped) {
    for (const pkg of layer.packages) {
      if (
        pathname === pkg.href ||
        pathname.startsWith(`${pkg.href}/`) ||
        pathname.startsWith(`/docs/${pkg.slug}`)
      ) {
        return layer.id;
      }
    }
  }
  return null;
}

/**
 * Menubar "Libraries" — layer strip on top, packages below (megamenu).
 */
export function LibrariesNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [activeLayerId, setActiveLayerId] = useState<PackageCategoryId>("capability");
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const active = isLibrariesNavActive(pathname);

  const grouped = useMemo(() => packagesByCategory(), []);

  const activeLayer =
    grouped.find((layer) => layer.id === activeLayerId) ?? grouped[0]!;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function openMenu() {
    setOpen((wasOpen) => {
      if (!wasOpen) {
        setActiveLayerId(layerFromPath(pathname) ?? "capability");
      }
      return !wasOpen;
    });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={openMenu}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
          open || active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        Libraries
        <ChevronDown
          className={cn(
            "size-3.5 opacity-70 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full left-0 z-50 mt-2 w-[min(44rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Library stack
            </p>
            <div className="flex items-center gap-3 text-[12px] font-semibold">
              <Link
                href="/roadmap"
                onClick={() => setOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Roadmap
              </Link>
              <Link
                href="/packages"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-accent"
              >
                All libraries
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="flex max-h-[min(32rem,calc(100vh-6rem))] flex-col">
            <div className="relative shrink-0 border-b border-border bg-muted/20">
              <div
                className="overflow-x-auto overscroll-x-contain px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Library layers"
              >
                <div className="flex w-max gap-2.5 pr-4">
                  {grouped.map((layer) => {
                    const selected = layer.id === activeLayerId;
                    const index = categoryIndex(layer.id);
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        data-layer={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={cn(
                          "flex w-[13rem] shrink-0 flex-col rounded-xl border px-4 py-3 text-left transition-colors",
                          selected
                            ? "border-[color:var(--layer-accent)]/50 bg-background shadow-sm ring-1 ring-[color:var(--layer-accent)]/20"
                            : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:bg-background/80 hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono text-[10px] font-semibold tabular-nums",
                              selected
                                ? "text-[color:var(--layer-accent)]"
                                : "text-muted-foreground",
                            )}
                          >
                            {String(index).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "text-[13px] font-semibold leading-tight",
                              selected && "text-foreground",
                            )}
                          >
                            {layer.label}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                          {layer.tagline}
                        </p>
                        <span className="mt-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                          {layer.packages.length}{" "}
                          {layer.packages.length === 1 ? "package" : "packages"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-muted/20 via-muted/20 to-transparent"
                aria-hidden
              />
            </div>

            <div
              className="min-h-[14rem] min-w-0 flex-1 overflow-y-auto p-4"
              data-layer={activeLayerId}
              role="tabpanel"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={activeLayer.href}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-semibold tracking-tight text-[color:var(--layer-accent)] hover:underline"
                  >
                    {activeLayer.label}
                  </Link>
                  <p className="mt-1 max-w-md text-[12px] leading-5 text-muted-foreground">
                    {activeLayer.tagline}
                  </p>
                </div>
                <Link
                  href={activeLayer.href}
                  onClick={() => setOpen(false)}
                  className="shrink-0 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-[color:var(--layer-accent)]"
                >
                  Layer overview →
                </Link>
              </div>

              {activeLayer.packages.length > 0 ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {activeLayer.packages.map((pkg) => {
                    const pkgActive =
                      pathname === pkg.href ||
                      pathname.startsWith(`${pkg.href}/`) ||
                      pathname.startsWith(`/docs/${pkg.slug}`);
                    return (
                      <li key={pkg.slug}>
                        <Link
                          href={pkg.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group block rounded-lg border px-3 py-3 shadow-sm transition-all",
                            pkgActive
                              ? "border-[color:var(--layer-accent)] bg-[color:var(--layer-soft)] ring-2 ring-[color:var(--layer-accent)]/25"
                              : "border-[color:var(--layer-accent)]/30 bg-card hover:border-[color:var(--layer-accent)]/55 hover:bg-[color:var(--layer-soft)] hover:shadow-md",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[13px] font-semibold",
                                pkgActive
                                  ? "text-[color:var(--layer-accent)]"
                                  : "text-foreground group-hover:text-[color:var(--layer-accent)]",
                              )}
                            >
                              {pkg.title}
                            </span>
                            <StatusBadge status={pkg.status} />
                          </div>
                          <span className="mt-1 block font-mono text-[10px] font-medium text-foreground/60">
                            {pkg.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-[color:var(--layer-accent)]/35 bg-[color:var(--layer-soft)] px-4 py-8 text-center">
                  <p className="text-sm font-semibold">Coming soon</p>
                  <p className="mx-auto mt-2 max-w-xs text-[12px] leading-5 text-muted-foreground">
                    ERP modules — PO, SO, product, GR, inventory, finance — as
                    separate packages. Prioritized catalog:{" "}
                    <Link
                      href="/roadmap/erp"
                      onClick={() => setOpen(false)}
                      className="font-semibold text-[color:var(--layer-accent)] hover:underline"
                    >
                      ERP catalog
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
