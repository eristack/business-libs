import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  categoryIndex,
  getCategory,
  type PackageCategoryId,
} from "@/lib/site";

type LayerBadgeProps = {
  categoryId: PackageCategoryId;
  href?: string | null;
  size?: "sm" | "md";
  className?: string;
  /** When false, render a non-link chip (e.g. inside buttons). */
  link?: boolean;
};

export function LayerBadge({
  categoryId,
  href,
  size = "sm",
  className,
  link = true,
}: LayerBadgeProps) {
  const category = getCategory(categoryId)!;
  const index = categoryIndex(categoryId);
  const target = href === null ? null : (href ?? category.href);

  const classNames = cn(
    "layer-accent-border inline-flex items-center gap-1.5 rounded-md border bg-background/80 text-foreground shadow-sm backdrop-blur",
    link && target
      ? "transition-colors hover:border-[color:var(--layer-accent)]"
      : null,
    size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5",
    className,
  );

  const inner = (
    <>
      <span
        className={cn(
          "font-mono font-semibold text-[color:var(--layer-accent)] tabular-nums",
          size === "sm" ? "text-[10px]" : "text-[11px]",
        )}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "font-semibold tracking-[0.14em] uppercase",
          size === "sm" ? "text-[10px]" : "text-[11px]",
        )}
      >
        {category.label}
      </span>
    </>
  );

  if (!link || !target) {
    return (
      <span data-layer={categoryId} className={classNames}>
        {inner}
      </span>
    );
  }

  return (
    <Link data-layer={categoryId} href={target} className={classNames}>
      {inner}
    </Link>
  );
}
