import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/stack/content-section";
import { LayerSection } from "@/components/stack/library-list";
import { PageHero } from "@/components/stack/page-hero";
import { StackChrome } from "@/components/stack/stack-chrome";
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
        chrome={
          <StackChrome
            crumbs={[
              { label: "Libraries", href: "/packages" },
              { label: "Docs" },
            ]}
            showLayerStrip
          />
        }
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Documentation
          </span>
        }
        title="Docs by layer"
        tagline="Same stack map as Libraries — Docs is the primary action here."
        description="Guides live under packages/<category>/<name>/docs. Prefer a product overview first? Use Overview on any row."
        actions={
          <Link
            href="/packages"
            className="text-[13px] font-semibold text-accent hover:underline"
          >
            ← Back to libraries
          </Link>
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
