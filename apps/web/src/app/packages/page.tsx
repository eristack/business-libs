import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { LayerSection } from "@/components/stack/library-list";
import { PageHero } from "@/components/stack/page-hero";
import { StackChrome } from "@/components/stack/stack-chrome";
import { packagesByCategory, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Libraries",
  description: `Open-source enterprise libraries under ${siteConfig.name}.`,
};

export default function PackagesPage() {
  const grouped = packagesByCategory();

  return (
    <>
      <PageHero
        tone="marketing"
        chrome={
          <StackChrome
            crumbs={[{ label: "Libraries", href: "/packages" }]}
            showLayerStrip
          />
        }
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Library stack
          </span>
        }
        title="Libraries by layer"
        tagline="Pick a layer, open a library overview, then read the docs."
        description="Eristack is organized as Primitive → Capability → Service → AI. Product pages explain each library; docs next to the code carry the contract."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#stack">
                Browse the stack
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Go to docs</Link>
            </Button>
          </>
        }
        meta={
          <ol className="grid max-w-2xl gap-2 text-[13px] text-muted-foreground sm:grid-cols-3">
            {[
              "1 · Choose a layer",
              "2 · Open a library",
              "3 · Read its docs",
            ].map((step) => (
              <li
                key={step}
                className="rounded-lg border border-border bg-card/80 px-3 py-2 font-medium text-foreground/80"
              >
                {step}
              </li>
            ))}
          </ol>
        }
      />

      <ContentSection
        id="stack"
        tone="muted"
        eyebrow="The stack"
        title="Four layers, one list style"
        description="Every page that shows libraries — home, this index, layer landings, docs — uses the same layer headers and library rows."
      >
        <div className="space-y-14">
          {grouped.map((category) => (
            <LayerSection
              key={category.id}
              categoryId={category.id}
              items={category.packages}
              variant="actions"
              description={category.description}
            />
          ))}
        </div>
      </ContentSection>
    </>
  );
}
