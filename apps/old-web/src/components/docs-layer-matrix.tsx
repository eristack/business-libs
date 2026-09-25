import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LayerGlyph } from "@/components/stack/layer-glyphs";
import { isComingSoon } from "@/components/stack/status-badge";
import { getPackageRelease } from "@/lib/package-meta";
import {
  categoryIndex,
  getCategory,
  packageCategories,
  packages,
  type PackageCategoryId,
} from "@/lib/site";

type DocsLayerMatrixProps = {
  /** Package slugs that have published docs. */
  docSlugs: ReadonlySet<string>;
};

export function DocsLayerMatrix({ docSlugs }: DocsLayerMatrixProps) {
  const grouped = packageCategories.map((category) => ({
    category,
    packages: packages.filter(
      (pkg) => pkg.category === category.id && docSlugs.has(pkg.slug),
    ),
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {grouped.map(({ category, packages: items }) => (
        <LayerDocsPanel
          key={category.id}
          categoryId={category.id}
          packages={items}
        />
      ))}
    </div>
  );
}

function LayerDocsPanel({
  categoryId,
  packages: items,
}: {
  categoryId: PackageCategoryId;
  packages: (typeof packages)[number][];
}) {
  const category = getCategory(categoryId)!;
  const index = categoryIndex(categoryId);

  return (
    <section
      data-layer={categoryId}
      className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-[0_1px_2px_rgba(26,24,20,0.03)]"
    >
      <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/30 px-4 py-3">
        <LayerGlyph layerId={categoryId} size={18} />
        <div className="min-w-0 flex-1">
          <Link
            href={category.href}
            className="group inline-flex items-center gap-2 transition-colors hover:text-[color:var(--layer-accent)]"
          >
            <span className="font-mono text-[11px] font-semibold text-[color:var(--layer-accent)] tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
            <span className="text-[12px] font-semibold tracking-[0.12em] text-foreground uppercase">
              {category.label}
            </span>
          </Link>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
            {category.tagline}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col p-2">
          {items.map((pkg) => {
            const release = getPackageRelease(pkg);
            return (
              <li key={pkg.slug}>
                <Link
                  href={pkg.docsHref}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {pkg.title}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {pkg.name}
                      {!isComingSoon(pkg.status) ? (
                        <span className="text-muted-foreground/70">
                          {" "}
                          · v{release.version}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-[color:var(--layer-accent)]" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">
          No docs yet — see{" "}
          <Link href="/roadmap" className="font-medium text-accent hover:underline">
            roadmap
          </Link>
          .
        </p>
      )}
    </section>
  );
}
