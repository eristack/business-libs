"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isLibrariesNavActive,
  packageCategories,
  packagesByCategory,
} from "@/lib/site";

/**
 * Menubar "Libraries" — layers + packages in a popover (replaces cramped hero strips).
 */
export function LibrariesNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const active = isLibrariesNavActive(pathname);

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

  const grouped = packagesByCategory();

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
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
          className="absolute top-full left-0 z-50 mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Layers · packages
            </p>
            <Link
              href="/packages"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-foreground/70 hover:text-foreground"
            >
              All libraries
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {grouped.map((layer) => {
              const category = packageCategories.find((c) => c.id === layer.id)!;
              return (
                <div
                  key={layer.id}
                  data-layer={layer.id}
                  className="min-w-0 rounded-xl border border-[color:var(--layer-accent)]/35 bg-[color:var(--layer-soft)] p-3 shadow-sm"
                >
                  <Link
                    href={category.href}
                    onClick={() => setOpen(false)}
                    className="text-[13px] font-semibold tracking-tight text-[color:var(--layer-accent)] hover:underline"
                  >
                    {category.label}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-foreground/65">
                    {category.tagline}
                  </p>
                  <ul className="mt-2.5 space-y-0.5">
                    {layer.packages.map((pkg) => {
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
                              "block rounded-md px-2 py-1.5 text-[12px] font-semibold transition-colors",
                              pkgActive
                                ? "bg-background text-foreground shadow-sm ring-1 ring-[color:var(--layer-accent)]/40"
                                : "text-foreground/85 hover:bg-background hover:text-foreground hover:shadow-sm",
                            )}
                          >
                            {pkg.title}
                            <span className="ml-1.5 font-mono text-[10px] font-medium text-foreground/55">
                              {pkg.name.replace("@eristack/", "")}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
