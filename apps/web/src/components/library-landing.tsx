import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodePanel } from "@/components/code-panel";
import { DocsInstallSnippet } from "@/components/docs-install-snippet";
import { hasPackageHeroDemo } from "@/components/package-demos/demo-slugs";
import { PackageHeroDemo } from "@/components/package-demos/package-hero-demo";
import {
  LibraryDocsCta,
  packageGettingStartedHref,
} from "@/components/library-docs-cta";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { FeatureGrid } from "@/components/stack/feature-grid";
import { LayerBadge } from "@/components/stack/layer-badge";
import { LibraryList } from "@/components/stack/library-list";
import { PageHero } from "@/components/stack/page-hero";
import { ReleaseMeta } from "@/components/stack/release-meta";
import {
  libraryCrumbs,
  StackChrome,
} from "@/components/stack/stack-chrome";
import { motifForPackage } from "@/lib/layer-theme";
import { getPackageRelease } from "@/lib/package-meta";
import {
  categoryIndex,
  getCategory,
  packages,
  packageCategories,
  packagesByCategory,
  siteConfig,
  type PackageCategoryId,
} from "@/lib/site";

type Category = (typeof packageCategories)[number];
type Package = (typeof packages)[number];

export async function CategoryLanding({ category }: { category: Category }) {
  const siblings = packagesByCategory().find(
    (item) => item.id === category.id,
  )!;
  const index = categoryIndex(category.id as PackageCategoryId);

  return (
    <div data-layer={category.id}>
      <PageHero
        tone="product"
        layerId={category.id}
        chrome={
          <StackChrome
            crumbs={libraryCrumbs({ categoryId: category.id })}
            activeLayerId={category.id}
            showLayerStrip={false}
            showPackageStrip={false}
          />
        }
        eyebrow={
          <LayerBadge categoryId={category.id} href={category.href} size="md" />
        }
        title={category.label}
        tagline={category.tagline}
        description={category.description}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#libraries">
                Browse libraries
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/packages">All libraries</Link>
            </Button>
          </>
        }
        meta={
          <p className="font-mono text-[12px] text-muted-foreground">
            Layer {String(index).padStart(2, "0")} · {siblings.packages.length}{" "}
            {siblings.packages.length === 1 ? "library" : "libraries"}
          </p>
        }
      />

      <ContentSection
        eyebrow="Why this layer"
        title={`What belongs in ${category.label}`}
        description="Same layer language everywhere — home, libraries index, and this landing."
      >
        <FeatureGrid highlights={category.highlights} />
      </ContentSection>

      <ContentSection
        id="libraries"
        tone="card"
        eyebrow="Libraries"
        title={`In the ${category.label} layer`}
        description="Open a library overview, then jump into docs when you are ready to wire it."
      >
        {siblings.packages.length > 0 ? (
          <LibraryList items={siblings.packages} variant="actions" />
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--layer-accent)]/40 bg-[color:var(--layer-soft)] px-6 py-10 text-center">
            <p className="text-lg font-semibold tracking-tight">Coming soon</p>
            <p className="mx-auto mt-2 max-w-lg text-[14px] leading-6 text-muted-foreground">
              ERP modules — PO, SO, product master, goods receipt, inventory
              transfer, journals, AP/AR — ship as separate packages here. Browse
              the full prioritized catalog in{" "}
              <Link
                href="/roadmap/erp"
                className="font-semibold text-[color:var(--layer-accent)] hover:underline"
              >
                ERP catalog
              </Link>{" "}
              (edit priorities anytime).
            </p>
          </div>
        )}
      </ContentSection>
    </div>
  );
}

export async function PackageLanding({ pkg }: { pkg: Package }) {
  const category = getCategory(pkg.category)!;
  const siblings = packagesByCategory().find(
    (item) => item.id === pkg.category,
  )!.packages;
  const motif = motifForPackage(pkg.slug);
  const release = getPackageRelease(pkg);

  return (
    <div data-layer={pkg.category}>
      <PageHero
        tone="product"
        layerId={pkg.category}
        motif={motif}
        chrome={
          <StackChrome
            crumbs={libraryCrumbs({
              categoryId: pkg.category,
              packageSlug: pkg.slug,
            })}
            activeLayerId={pkg.category}
            activePackageSlug={pkg.slug}
            showLayerStrip={false}
            showPackageStrip={false}
          />
        }
        eyebrow={
          <>
            <LayerBadge categoryId={pkg.category} />
            <span className="font-mono text-[12px] text-muted-foreground">
              {pkg.name}
            </span>
            <ReleaseMeta status={pkg.status} release={release} size="md" />
          </>
        }
        title={pkg.title}
        tagline={pkg.tagline}
        description={pkg.description}
        actions={
          <>
            <Button asChild size="lg">
              <Link href={packageGettingStartedHref(pkg)}>
                Getting started
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={pkg.docsHref}>All docs</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={release.changelogHref}>Changelog</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={`${siteConfig.github}/tree/main/${pkg.directory}`}
                target="_blank"
                rel="noreferrer"
              >
                Source
              </a>
            </Button>
          </>
        }
        meta={<DocsInstallSnippet command={pkg.install} className="mt-0" />}
        aside={
          hasPackageHeroDemo(pkg.slug) ? (
            <PackageHeroDemo slug={pkg.slug} />
          ) : undefined
        }
        footer={
          <CodePanel
            code={pkg.sample.code}
            filename={pkg.sample.filename}
            language={pkg.sample.language}
          />
        }
      />

      <ContentSection
        eyebrow="Highlights"
        title={`Why teams reach for ${pkg.title}`}
      >
        <FeatureGrid highlights={pkg.highlights} />
      </ContentSection>

      <LibraryDocsCta
        pkg={pkg}
        categoryLabel={category.label}
        categoryHref={category.href}
      />

      {siblings.length > 1 ? (
        <ContentSection
          eyebrow="Same layer"
          title={`Other ${category.label} libraries`}
        >
          <LibraryList
            items={siblings.filter((item) => item.slug !== pkg.slug)}
            variant="overview"
          />
        </ContentSection>
      ) : null}
    </div>
  );
}
