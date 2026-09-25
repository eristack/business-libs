import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentSectionProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  tone?: "default" | "muted" | "card";
  className?: string;
  id?: string;
};

/** Shared band under heroes — keeps stack pages visually consistent. */
export function ContentSection({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
  className,
  id,
}: ContentSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-border",
        tone === "muted" && "bg-docs-rail",
        tone === "card" && "bg-card",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        {eyebrow || title || description ? (
          <div className="mb-8 max-w-2xl">
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
