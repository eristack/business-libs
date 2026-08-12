import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  /** marketing = home/stack; product = layer/library landings */
  tone?: "marketing" | "product";
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
      className={cn(
        "relative overflow-hidden border-b-2 border-foreground/10",
        tone === "marketing" ? "bg-background" : "bg-docs-rail",
        className,
      )}
    >
      <div className="hero-noise pointer-events-none absolute inset-0" />
      <div className="hero-orbit pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-12 sm:px-6 lg:pt-14 lg:pb-16">
        {chrome ? <div className="mb-8">{chrome}</div> : null}

        <div
          className={cn(
            "grid gap-10",
            aside && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12",
          )}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <div className="animate-rise mb-4 flex flex-wrap items-center gap-2">
                {eyebrow}
              </div>
            ) : null}

            <div className="animate-rise-delay-1 border-l-2 border-accent pl-4 sm:pl-5">
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
          <div className="animate-rise-delay-3 mt-10 border-t border-border/80 pt-6">
            {footer}
          </div>
        ) : null}
      </div>

      {/* Hard seam: hero surface ends, page content begins */}
      <div
        className="relative h-2 border-t border-border bg-background"
        aria-hidden
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/50 via-accent/20 to-transparent" />
      </div>
    </section>
  );
}
