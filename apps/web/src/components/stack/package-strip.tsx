import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPackageRelease } from "@/lib/package-meta";
import { packages, type PackageCategoryId } from "@/lib/site";

type PackageStripProps = {
  activeLayerId?: PackageCategoryId;
  activePackageSlug?: string;
  className?: string;
};

/** Dense library chips under the four layer boxes. */
export function PackageStrip({
  activeLayerId,
  activePackageSlug,
  className,
}: PackageStripProps) {
  return (
    <nav aria-label="Libraries" className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Libraries
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {packages.map((pkg) => {
          const inActiveLayer = !activeLayerId || pkg.category === activeLayerId;
          const active = pkg.slug === activePackageSlug;
          const version = getPackageRelease(pkg).version;
          return (
            <li key={pkg.slug}>
              <Link
                href={pkg.href}
                data-layer={pkg.category}
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] transition-colors",
                  active
                    ? "layer-chip-active border-[color:var(--layer-accent)] bg-[color:var(--layer-soft)] text-foreground"
                    : inActiveLayer
                      ? "border-border bg-background/80 text-foreground hover:border-[color:var(--layer-accent)]/45"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    active || inActiveLayer
                      ? "bg-[color:var(--layer-accent)]"
                      : "bg-muted-foreground/40",
                  )}
                  aria-hidden
                />
                <span className="truncate font-sans text-[11px] font-semibold tracking-tight">
                  {pkg.title}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  v{version}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
