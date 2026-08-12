import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getCategory,
  getPackage,
  type PackageCategoryId,
} from "@/lib/site";
import { LayerStrip } from "@/components/stack/layer-strip";
import { PackageStrip } from "@/components/stack/package-strip";

type Crumb = { label: string; href?: string };

type StackChromeProps = {
  crumbs: Crumb[];
  activeLayerId?: PackageCategoryId;
  activePackageSlug?: string;
  showLayerStrip?: boolean;
  showPackageStrip?: boolean;
  className?: string;
};

/** Breadcrumb + layer boxes + dense library chips. */
export function StackChrome({
  crumbs,
  activeLayerId,
  activePackageSlug,
  showLayerStrip = true,
  showPackageStrip = true,
  className,
}: StackChromeProps) {
  return (
    <div
      className={cn("space-y-4", className)}
      data-layer={activeLayerId}
    >
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[12px]"
      >
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <span
              key={`${crumb.label}-${index}`}
              className="inline-flex items-center gap-1.5"
            >
              {index > 0 ? (
                <span className="text-muted-foreground/70">/</span>
              ) : null}
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-muted-foreground transition-colors hover:text-[color:var(--layer-accent,var(--accent))]"
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

      {showLayerStrip ? (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Layers
          </p>
          <LayerStrip activeId={activeLayerId} />
          {showPackageStrip ? (
            <PackageStrip
              activeLayerId={activeLayerId}
              activePackageSlug={activePackageSlug}
            />
          ) : null}
        </div>
      ) : null}
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
