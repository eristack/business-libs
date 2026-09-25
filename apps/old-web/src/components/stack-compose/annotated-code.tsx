"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getPackage } from "@/lib/site";
import {
  composePackageCategory,
  composePackageShort,
  lineInRange,
  type ComposeCodeFile,
  type ComposeCodeTab,
  type ComposeFocusRange,
  type ComposePackageSlug,
} from "@/lib/stack-compose";

type AnnotatedCodeProps = {
  file: ComposeCodeFile;
  tab: ComposeCodeTab;
  activePackage: ComposePackageSlug | null;
  focusRange?: ComposeFocusRange;
  /** Dim this panel when the active step has no focus here */
  inactive?: boolean;
};

const tabMeta: Record<
  ComposeCodeTab,
  { label: string; prompt?: string }
> = {
  backend: { label: "Backend" },
  frontend: { label: "Frontend" },
  terminal: { label: "Terminal", prompt: "$" },
};

export function AnnotatedCode({
  file,
  tab,
  activePackage,
  focusRange,
  inactive = false,
}: AnnotatedCodeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    firstFocusRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusRange?.from, tab]);

  const meta = tabMeta[tab];

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-sm transition-opacity",
        inactive && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-3 py-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {meta.label}
        </span>
        <span className="truncate font-mono text-[11px] text-foreground/80">
          {file.filename}
        </span>
      </div>
      <div ref={scrollRef} className="max-h-[min(32rem,70vh)] overflow-auto">
        <table className="w-full min-w-[20rem] border-collapse font-mono text-[12px] leading-[1.65]">
          <tbody>
            {file.lines.map((line, index) => {
              const lineNumber = index + 1;
              const linePackages = line.packages ?? [];
              const isEmpty = line.text.trim() === "";
              const inFocus = lineInRange(lineNumber, focusRange);
              const isFirstFocus = focusRange?.from === lineNumber;

              const packageHit =
                activePackage !== null &&
                linePackages.includes(activePackage);
              const packageDim =
                activePackage !== null &&
                linePackages.length > 0 &&
                !linePackages.includes(activePackage);

              const stepDim =
                focusRange !== undefined && !inFocus && !isEmpty;

              return (
                <tr
                  key={`${lineNumber}-${line.text.slice(0, 16)}`}
                  ref={isFirstFocus ? firstFocusRef : undefined}
                  className={cn(
                    "transition-[opacity,background-color] duration-200",
                    (stepDim || packageDim) && "opacity-[0.28]",
                    inFocus && "bg-foreground/[0.04] dark:bg-foreground/[0.06]",
                    packageHit && "bg-[color:var(--layer-soft)]",
                  )}
                  data-layer={
                    packageHit && activePackage
                      ? composePackageCategory(activePackage)
                      : inFocus && linePackages[0]
                        ? composePackageCategory(linePackages[0])
                        : undefined
                  }
                >
                  <td className="w-[4.25rem] select-none border-r border-border/40 px-1 py-0 align-top">
                    <div className="flex min-h-[1.65em] flex-wrap justify-end gap-0.5">
                      {linePackages.map((slug) => (
                        <PackageGutterPill
                          key={slug}
                          slug={slug}
                          active={activePackage === slug}
                          muted={
                            (activePackage !== null &&
                              activePackage !== slug) ||
                            (stepDim && !inFocus)
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td className="w-8 select-none border-r border-border/40 px-1 py-0 text-right align-top text-[10px] text-muted-foreground/60 tabular-nums">
                    {isEmpty ? "" : lineNumber}
                  </td>
                  <td
                    className={cn(
                      "whitespace-pre px-3 py-0 align-top",
                      tab === "terminal"
                        ? "text-emerald-800 dark:text-emerald-200/90"
                        : "text-foreground/90",
                      isEmpty && "h-[1.65em]",
                      inFocus &&
                        "border-l-2 border-l-foreground/40 dark:border-l-foreground/50",
                      packageHit &&
                        "border-l-2 border-l-[color:var(--layer-accent)]",
                      !inFocus &&
                        !packageHit &&
                        "border-l-2 border-l-transparent",
                    )}
                    data-layer={
                      linePackages[0]
                        ? composePackageCategory(linePackages[0])
                        : undefined
                    }
                  >
                    {tab === "terminal" && !isEmpty && meta.prompt ? (
                      <>
                        {!line.text.startsWith("#") ? (
                          <span className="mr-2 select-none text-emerald-600/70 dark:text-emerald-400/60">
                            {meta.prompt}
                          </span>
                        ) : null}
                        <span>{line.text}</span>
                      </>
                    ) : (
                      line.text || "\u00a0"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageGutterPill({
  slug,
  active,
  muted,
}: {
  slug: ComposePackageSlug;
  active: boolean;
  muted: boolean;
}) {
  const category = composePackageCategory(slug);
  return (
    <span
      data-layer={category}
      title={getPackage(slug)?.name}
      className={cn(
        "rounded px-1 py-px text-[8px] font-semibold tracking-tight text-[color:var(--layer-accent)] uppercase",
        "bg-[color:var(--layer-soft)] ring-1 ring-[color:var(--layer-rail)]",
        active && "ring-2 ring-[color:var(--layer-accent)]",
        muted && "opacity-40",
      )}
    >
      {composePackageShort[slug]}
    </span>
  );
}

type CodeTabBarProps = {
  activeTab: ComposeCodeTab;
  onTabChange: (tab: ComposeCodeTab) => void;
  stepFocus: Partial<Record<ComposeCodeTab, ComposeFocusRange>>;
};

export function CodeTabBar({
  activeTab,
  onTabChange,
  stepFocus,
}: CodeTabBarProps) {
  const tabs: ComposeCodeTab[] = ["backend", "frontend", "terminal"];

  return (
    <div className="flex gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
      {tabs.map((tab) => {
        const active = tab === activeTab;
        const hasFocus = stepFocus[tab] !== undefined;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative flex-1 rounded-lg px-3 py-2 text-center text-[12px] font-medium transition-colors sm:text-[13px]",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {tabMeta[tab].label}
            {hasFocus ? (
              <span
                className={cn(
                  "absolute top-1.5 right-1.5 size-1.5 rounded-full",
                  active ? "bg-foreground" : "bg-muted-foreground/60",
                )}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type PackageLegendProps = {
  activePackage: ComposePackageSlug | null;
  onSelect: (slug: ComposePackageSlug | null) => void;
  catalog: { slug: ComposePackageSlug; moment: string }[];
};

export function PackageLegend({
  activePackage,
  onSelect,
  catalog,
}: PackageLegendProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
            activePackage === null
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          All packages
        </button>
        <span className="text-[11px] text-muted-foreground">
          Click a library to highlight its lines in the file
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map(({ slug, moment }) => {
          const pkg = getPackage(slug)!;
          const selected = activePackage === slug;
          return (
            <button
              key={slug}
              type="button"
              data-layer={pkg.category}
              onClick={() => onSelect(selected ? null : slug)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                "border-border/80 bg-background/80 hover:border-[color:var(--layer-accent)]",
                selected &&
                  "border-[color:var(--layer-accent)] bg-[color:var(--layer-soft)] ring-1 ring-[color:var(--layer-accent)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-[color:var(--layer-accent)]">
                  {pkg.name}
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase">
                  {pkg.category}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
                {moment}
              </p>
              <Link
                href={pkg.href}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-block text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
              >
                {pkg.title} docs →
              </Link>
            </button>
          );
        })}
      </div>
    </div>
  );
}
