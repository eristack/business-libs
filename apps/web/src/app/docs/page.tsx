import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/stack/content-section";
import { LayerSection } from "@/components/stack/library-list";
import { PageHero } from "@/components/stack/page-hero";
import { getDocPackages } from "@/lib/docs";
import { packageCategories, packages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and API notes for Eristack packages.",
};

export default function DocsIndexPage() {
  const docPackages = getDocPackages();
  const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg]));

  const grouped = packageCategories.map((category) => ({
    ...category,
    packages: docPackages
      .filter((pkg) => pkg.category === category.id)
      .map((pkg) => bySlug.get(pkg.slug)!)
      .filter(Boolean),
  }));

  return (
    <>
      <PageHero
        tone="product"
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Documentation
          </span>
        }
        title="Docs"
        tagline="Guides next to the code. Pick a library and read."
        description="Library discovery and layer navigation live under Libraries. This page is only the documentation index."
        actions={
          <Link
            href="/packages"
            className="text-[13px] font-semibold text-accent hover:underline"
          >
            ← Browse libraries
          </Link>
        }
        meta={
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground"
          >
            <Link href="/packages" className="hover:text-accent">
              Libraries
            </Link>
            <span>/</span>
            <span className="text-foreground">Docs</span>
          </nav>
        }
      />

      <ContentSection tone="muted">
        <div className="space-y-14">
          {grouped.map((category) => (
            <LayerSection
              key={category.id}
              categoryId={category.id}
              items={category.packages}
              variant="docs"
              description={category.tagline}
            />
          ))}
        </div>
      </ContentSection>
    </>
  );
}
