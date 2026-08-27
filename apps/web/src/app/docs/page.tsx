import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { DocsHubRecommend } from "@/components/docs-hub-recommend";
import { DocsHubPaths } from "@/components/docs-hub-paths";
import { DocsLayerMatrix } from "@/components/docs-layer-matrix";
import { LayerStrip } from "@/components/stack/layer-strip";
import { PageHero } from "@/components/stack/page-hero";
import { getDocPackages } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Guides and API notes for Eristack packages — browse by layer or follow a guided path.",
};

export default function DocsIndexPage() {
  const docPackages = getDocPackages();
  const docSlugs = new Set(docPackages.map((pkg) => pkg.slug));

  return (
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Documentation
          </span>
        }
        title="Library docs"
        tagline="Guides live next to the code — pick a path or browse by layer."
        description="Every page renders markdown from `packages/*/docs` in the monorepo. Use Cmd+K to search titles and body text across all libraries."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#layers">
                Browse by layer
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/packages">Library overviews</Link>
            </Button>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-2 font-medium text-foreground/80">
              <Search className="size-3.5 opacity-60" aria-hidden />
              <kbd className="font-mono text-[11px]">⌘K</kbd>
              <span>search docs</span>
            </span>
            <span>{docPackages.length} libraries documented</span>
          </div>
        }
        footer={<LayerStrip className="max-w-5xl" />}
      />

      <ContentSection
        eyebrow="Agent routing"
        title="What recommend() suggests"
        description="Example product language mapped through @eristack/ai-knowledge recipes at build time."
        tone="card"
      >
        <DocsHubRecommend />
      </ContentSection>

      <ContentSection
        eyebrow="Guided paths"
        title="Start with a journey"
        description="Common integration arcs — each links to the canonical getting-started or upgrade guide."
        tone="muted"
      >
        <DocsHubPaths />
      </ContentSection>

      <ContentSection
        id="layers"
        eyebrow="Layer matrix"
        title="All libraries"
        description="Seven layers from primitive value types to AI workflow — open docs for any published package."
      >
        <DocsLayerMatrix docSlugs={docSlugs} />
      </ContentSection>
    </>
  );
}
