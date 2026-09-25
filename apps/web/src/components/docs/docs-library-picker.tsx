"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { packageCategories } from "@/lib/site";

export type DocsLibraryOption = {
  slug: string;
  title: string;
  name: string;
  category: string;
};

type DocsLibraryPickerProps = {
  packageSlug: string;
  options: DocsLibraryOption[];
  className?: string;
};

export function DocsLibraryPicker({
  packageSlug,
  options,
  className,
}: DocsLibraryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const current = options.find((item) => item.slug === packageSlug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.slug.includes(q),
    );
  }, [options, query]);

  const grouped = useMemo(() => {
    return packageCategories
      .map((category) => ({
        category,
        items: filtered.filter((item) => item.category === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-border bg-surface px-3 py-2.5 text-left shadow-sm transition-colors",
          "hover:border-primary/25 hover:bg-surface-raised",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          open && "border-primary/30 bg-surface-raised ring-2 ring-primary/15",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {current?.title ?? "Choose library"}
          </p>
          <p className="truncate font-mono text-[11px] text-muted">
            {current?.name ?? "—"}
          </p>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Choose documentation library"
          className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="border-b border-border p-2">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter…"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>
          <div className="max-h-[min(18rem,45vh)] overflow-y-auto overscroll-contain p-1.5">
            {grouped.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">No matches.</p>
            ) : (
              grouped.map(({ category, items }) => (
                <div key={category.id} className="mb-2 last:mb-0">
                  <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {category.label}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const active = item.slug === packageSlug;
                      return (
                        <li key={item.slug}>
                          <Link
                            href={`/docs/${item.slug}`}
                            onClick={() => {
                              setOpen(false);
                              setQuery("");
                            }}
                            className={cn(
                              "flex items-start gap-2 rounded-lg px-2.5 py-2 transition-colors",
                              active
                                ? "bg-primary/10 text-foreground"
                                : "text-foreground/90 hover:bg-surface",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">
                                {item.title}
                              </span>
                              <span className="block font-mono text-[10px] text-muted">
                                {item.name}
                              </span>
                            </span>
                            {active ? (
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-primary"
                                aria-hidden
                              />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
