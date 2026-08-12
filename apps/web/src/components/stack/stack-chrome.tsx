import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getCategory,
  getPackage,
  type PackageCategoryId,
} from "@/lib/site";
import { LayerStrip } from "@/components/stack/layer-strip";

type Crumb = { label: string; href?: string };

type StackChromeProps = {
  crumbs: Crumb[];
  activeLayerId?: PackageCategoryId;
  showLayerStrip?: boolean;
  className?: string;
};

/** Breadcrumb + optional layer strip — shared on stack/library pages. */
export function StackChrome({
  crumbs,
  activeLayerId,
  showLayerStrip = true,
  className,
}: StackChromeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px]">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-muted-foreground/70">/</span>
              ) : null}
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-muted-foreground transition-colors hover:text-accent"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium",
                    last ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      {showLayerStrip ? <LayerStrip activeId={activeLayerId} /> : null}
    </div>
  );
}

export function libraryCrumbs(options: {
  categoryId: PackageCategoryId;
  packageSlug?: string;
}): Crumb[] {
  const category = getCategory(options.categoryId)!;
  const crumbs: Crumb[] = [
    { label: "Libraries", href: "/packages" },
    { label: category.label, href: category.href },
  ];
  if (options.packageSlug) {
    const pkg = getPackage(options.packageSlug);
    if (pkg) crumbs.push({ label: pkg.title, href: pkg.href });
  }
  return crumbs;
}
