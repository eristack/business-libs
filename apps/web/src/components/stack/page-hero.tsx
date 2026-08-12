import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PackageCategoryId } from "@/lib/site";
import type { LibraryMotifId } from "@/lib/layer-theme";
import {
  LayerMotif,
  LibraryMotif,
} from "@/components/stack/library-motif";

type PageHeroProps = {
  /** marketing = home/stack; product = layer/library landings */
  tone?: "marketing" | "product";
  layerId?: PackageCategoryId;
  motif?: LibraryMotifId | null;
  chrome?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  tagline?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  /** Content pinned to the bottom of the hero (e.g. layer strip). */
  footer?: ReactNode;
  className?: string;
};

/**
 * Shared hero shell with a clear visual end: distinct surface, grid, and
 * a hard bottom edge before page content begins.
 */
export function PageHero({
  tone = "product",
  layerId,
  motif,
  chrome,
  eyebrow,
  title,
  tagline,
  description,
  actions,
  meta,
  aside,
  footer,
  className,
}: PageHeroProps) {
  return (
    <section
      data-layer={layerId}
      className={cn(
        /* overflow-x only — never clip tall code / demos in the hero */
        "relative overflow-x-hidden border-b-2 border-foreground/10",
        tone === "marketing" ? "bg-background" : "bg-docs-rail",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          layerId ? "layer-hero-noise" : "hero-noise",
        )}
      />
      <div className="hero-orbit pointer-events-none absolute inset-0 opacity-70" />
      {motif ? <LibraryMotif motif={motif} /> : null}
      {!motif && layerId ? <LayerMotif layerId={layerId} /> : null}

      <div
        className={cn(
          "relative mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:pt-14",
          aside || footer ? "pb-20 lg:pb-24" : "pb-16 lg:pb-20",
        )}
      >
        {chrome ? <div className="mb-8">{chrome}</div> : null}

        <div
          className={cn(
            "grid gap-10",
            aside &&
              "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12",
          )}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <div className="animate-rise mb-4 flex flex-wrap items-center gap-2">
                {eyebrow}
              </div>
            ) : null}

            <div
              className={cn(
                "animate-rise-delay-1 border-l-2 pl-4 sm:pl-5",
                layerId ? "border-[color:var(--layer-accent)]" : "border-accent",
              )}
            >
              <h1
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  tone === "marketing"
                    ? "text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]"
                    : "text-4xl sm:text-5xl lg:text-[3.15rem] lg:leading-[1.08]",
                )}
              >
                {title}
              </h1>
              {tagline ? (
                <p className="mt-4 max-w-2xl text-lg font-medium tracking-tight text-foreground/80">
                  {tagline}
                </p>
              ) : null}
            </div>

            {description ? (
              <p className="animate-rise-delay-2 mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}

            {actions ? (
              <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
                {actions}
              </div>
            ) : null}

            {meta ? (
              <div className="animate-rise-delay-3 mt-8">{meta}</div>
            ) : null}
          </div>

          {aside ? (
            <div className="animate-rise-delay-2 min-w-0 lg:pt-2">{aside}</div>
          ) : null}
        </div>

        {footer ? (
          <div className="animate-rise-delay-3 mt-10 min-w-0 border-t border-border/80 pt-6">
            {footer}
          </div>
        ) : null}
      </div>

      <div
        className="relative h-2 border-t border-border bg-background"
        aria-hidden
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
            layerId
              ? "from-[color:var(--layer-accent)] via-[color:var(--layer-rail)]"
              : "from-accent/50 via-accent/20",
          )}
        />
      </div>
    </section>
  );
}
