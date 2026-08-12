import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  categoryIndex,
  getCategory,
  type PackageCategoryId,
} from "@/lib/site";

type CategoryHeadingProps = {
  categoryId: PackageCategoryId;
  description?: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  /** When true, the label links to the category landing page. */
  linkToLanding?: boolean;
  className?: string;
};

export function categoryMeta(categoryId: PackageCategoryId) {
  return getCategory(categoryId)!;
}

export function CategoryHeading({
  categoryId,
  description,
  count,
  size = "md",
  linkToLanding = true,
  className,
}: CategoryHeadingProps) {
  const category = categoryMeta(categoryId);
  const index = categoryIndex(categoryId);
  const body = description ?? category.description;

  const label = (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "font-mono font-semibold text-accent tabular-nums",
          size === "sm" && "text-[11px]",
          size === "md" && "text-[12px]",
          size === "lg" && "text-[13px]",
        )}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "font-semibold tracking-[0.16em] text-foreground uppercase",
          size === "sm" && "text-[11px]",
          size === "md" && "text-[12px]",
          size === "lg" && "text-[13px]",
        )}
      >
        {category.label}
      </span>
    </span>
  );

  return (
    <div
      className={cn(
        "border-b border-border",
        size === "sm" && "pb-2",
        size === "md" && "pb-3",
        size === "lg" && "pb-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        {linkToLanding ? (
          <Link
            href={category.href}
            className="transition-colors hover:text-accent"
          >
            {label}
          </Link>
        ) : (
          label
        )}
        {typeof count === "number" ? (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {count}
          </span>
        ) : null}
      </div>
      {body ? (
        <p
          className={cn(
            "mt-1.5 max-w-2xl text-muted-foreground",
            size === "sm" && "text-[12px] leading-4",
            size === "md" && "text-[13px] leading-5",
            size === "lg" && "text-[14px] leading-6",
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
