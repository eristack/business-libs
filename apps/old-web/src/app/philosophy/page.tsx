import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { FeatureGrid } from "@/components/stack/feature-grid";
import { PageHero } from "@/components/stack/page-hero";
import { packageDesignTargets, tenets } from "@/lib/site";

export const metadata: Metadata = {
  title: "Philosophy",
  description: "Product tenets and design targets that guide Eristack libraries.",
};

export default function PhilosophyPage() {
  return (
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Philosophy
          </span>
        }
        title="Product tenets & design targets"
        tagline="Constraints we use when deciding what belongs in a package — and what must stay in your app."
        description="Tenets are product philosophy. Design targets are the integration quality bar agents and teams should expect from every @eristack/* package."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/docs/ai-knowledge/getting-started">
                Agent workflow docs
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/story">Read the story</Link>
            </Button>
          </>
        }
      />

      <ContentSection
        eyebrow="Design targets"
        title="Cheap, predictable, reliable, clear boundaries"
        description="Every package iteration is judged against these four targets — documented in ai-knowledge for agents."
      >
        <FeatureGrid highlights={packageDesignTargets} />
      </ContentSection>

      <ContentSection tone="muted" eyebrow="Tenets" title="How we decide scope">
        <ol className="grid gap-0 border-t border-border md:grid-cols-2">
          {tenets.map((tenet, index) => (
            <li
              key={tenet.title}
              className="border-b border-border py-8 md:odd:border-r md:odd:pr-8 md:even:pl-8"
            >
              <p className="font-mono text-[11px] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">
                {tenet.title}
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-7 text-muted-foreground">
                {tenet.body}
              </p>
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContentSection tone="card">
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/docs">Browse docs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/packages">Browse libraries</Link>
          </Button>
        </div>
      </ContentSection>
    </>
  );
}
