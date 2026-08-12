import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  categoryIndex,
  packagesByCategory,
  type PackageCategoryId,
} from "@/lib/site";

type LayerStripProps = {
  activeId?: PackageCategoryId;
  className?: string;
};

export function LayerStrip({ activeId, className }: LayerStripProps) {
  const grouped = packagesByCategory();

  return (
    <nav
      aria-label="Library layers"
      className={cn(
        "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {grouped.map((category) => {
        const active = category.id === activeId;
        const index = categoryIndex(category.id);
        return (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              "group flex flex-col gap-1 rounded-xl border px-3 py-3 transition-colors",
              active
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-background/70 hover:border-accent/35",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold text-accent tabular-nums">
                {String(index).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
                {category.label}
              </span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                {category.packages.length}
              </span>
            </div>
            <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
              {category.tagline}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
