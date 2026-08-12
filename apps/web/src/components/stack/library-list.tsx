import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  categoryIndex,
  getCategory,
  packages,
  type PackageCategoryId,
} from "@/lib/site";

type Package = (typeof packages)[number];

type LibraryListProps = {
  items: readonly Package[];
  /** overview = row → landing; actions = Overview+Docs; docs = Docs+Overview */
  variant?: "overview" | "actions" | "docs";
  className?: string;
};

export function LibraryList({
  items,
  variant = "overview",
  className,
}: LibraryListProps) {
  return (
    <ul
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {items.map((pkg) => (
        <li key={pkg.slug}>
          {variant === "actions" || variant === "docs" ? (
            <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 sm:py-7">
              <LibraryCopy pkg={pkg} />
              <div className="flex flex-wrap gap-2">
                {variant === "docs" ? (
                  <>
                    <Button asChild size="sm">
                      <Link href={pkg.docsHref}>
                        Docs
                        <ArrowRight />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={pkg.href}>Overview</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="sm">
                      <Link href={pkg.href}>
                        Overview
                        <ArrowRight />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={pkg.docsHref}>Docs</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link
              href={pkg.href}
              className="group grid gap-3 px-5 py-6 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 sm:py-7"
            >
              <LibraryCopy pkg={pkg} />
              <span className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-muted-foreground transition-colors group-hover:text-accent sm:self-center">
                Overview
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function LibraryCopy({ pkg }: { pkg: Package }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[12px] text-muted-foreground">{pkg.name}</p>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {pkg.status}
        </span>
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
        {pkg.title}
      </p>
      <p className="mt-1.5 text-[14px] font-medium text-foreground/75">
        {pkg.tagline}
      </p>
      <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">
        {pkg.description}
      </p>
    </div>
  );
}

type LayerSectionProps = {
  categoryId: PackageCategoryId;
  title?: string;
  description?: string;
  items: readonly Package[];
  variant?: LibraryListProps["variant"];
  showLayerLink?: boolean;
};

export function LayerSection({
  categoryId,
  title,
  description,
  items,
  variant = "overview",
  showLayerLink = true,
}: LayerSectionProps) {
  const category = getCategory(categoryId)!;
  const index = categoryIndex(categoryId);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={category.href}
            className="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <span className="font-mono text-[12px] font-semibold text-accent tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
            <span className="text-[12px] font-semibold tracking-[0.16em] text-foreground uppercase">
              {title ?? category.label}
            </span>
          </Link>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-muted-foreground">
            {description ?? category.tagline}
          </p>
        </div>
        {showLayerLink ? (
          <Link
            href={category.href}
            className="text-[12px] font-semibold text-muted-foreground transition-colors hover:text-accent"
          >
            Layer overview →
          </Link>
        ) : null}
      </div>
      <LibraryList items={items} variant={variant} />
    </section>
  );
}
