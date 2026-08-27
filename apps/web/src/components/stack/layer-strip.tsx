import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayerGlyph } from "@/components/stack/layer-glyphs";
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
      className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7", className)}
    >
      {grouped.map((category) => {
        const active = category.id === activeId;
        const index = categoryIndex(category.id);
        return (
          <Link
            key={category.id}
            href={category.href}
            data-layer={category.id}
            className={cn(
              "group flex flex-col gap-1 rounded-xl border px-3 py-3 transition-colors",
              active
                ? "border-[color:var(--layer-accent)] bg-[color:var(--layer-soft)]"
                : "border-border bg-background/70 hover:border-[color:var(--layer-accent)]/40",
            )}
          >
            <div className="flex items-center gap-2">
              <LayerGlyph layerId={category.id} size={15} />
              <span className="font-mono text-[10px] font-semibold text-[color:var(--layer-accent)] tabular-nums">
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
