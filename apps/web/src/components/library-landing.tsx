import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodePanel } from "@/components/code-panel";
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
        <LibraryList items={siblings.packages} variant="actions" />
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
              <Link href={pkg.docsHref}>
                Read the docs
                <ArrowRight />
              </Link>
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
        meta={
          <pre className="max-w-lg overflow-x-auto rounded-lg border border-border bg-background/80 px-4 py-3 font-mono text-[13px] text-foreground shadow-sm">
            <code>{pkg.install}</code>
          </pre>
        }
        aside={
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

      <ContentSection tone="card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Ready to wire it in?
            </h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Guides live next to the code under {pkg.directory}/docs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={pkg.docsHref}>
                Open docs
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={category.href}>More in {category.label}</Link>
            </Button>
          </div>
        </div>
      </ContentSection>

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
