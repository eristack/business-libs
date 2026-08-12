import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Shield } from "lucide-react";
import { CodePanel } from "@/components/code-panel";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { LayerSection } from "@/components/stack/library-list";
import { LayerStrip } from "@/components/stack/layer-strip";
import { PackageStrip } from "@/components/stack/package-strip";
import { PageHero } from "@/components/stack/page-hero";
import { packagesByCategory, siteConfig, tenets } from "@/lib/site";

const homeSample = `import { Money } from "@eristack/money"

const total = Money.of("19.99", "USD")
  .add(Money.of("0.10", "USD"))`;

export default async function HomePage() {
  const grouped = packagesByCategory();

  return (
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card/80 px-2.5 py-1 text-[12px] font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-sm bg-accent" />
            Subsidiary of{" "}
            <a
              href={siteConfig.erista}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-accent"
            >
              erista.id
            </a>
          </div>
        }
        title={
          <>
            Enterprise business libraries
            <span className="mt-1 block text-muted-foreground">
              for TypeScript.
            </span>
          </>
        }
        description={`${siteConfig.description} Extracted from the frustration of shipping real ERP software without shared domain libraries.`}
        actions={
          <>
            <Button asChild size="lg" className="h-11 px-6 text-sm shadow-sm">
              <Link href="/packages">
                Browse libraries
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-6 text-sm"
            >
              <Link href="/story">Why we built this</Link>
            </Button>
          </>
        }
        aside={
          <CodePanel
            code={homeSample}
            filename="money.ts"
            language="ts"
            caption="string-first · same-currency arithmetic · ledger-safe"
          />
        }
        footer={
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Layers
              </p>
              <LayerStrip />
            </div>
            <PackageStrip />
          </div>
        }
      />

      <section className="border-b border-border bg-zinc-950 text-zinc-100">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: "Layer → library → docs",
              body: "One path through the site. Libraries for discovery, docs for the contract.",
            },
            {
              icon: Shield,
              title: "Production-shaped",
              body: "Refresh rotation, scrypt credentials, money and doc numbers that add up.",
            },
            {
              icon: BookOpen,
              title: "Shared UI atoms",
              body: "Heroes, layer strips, and library rows look the same on every stack page.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-zinc-400">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ContentSection
        tone="card"
        eyebrow="The stack"
        title="Start with the layer you need"
        description="Same LayerSection + LibraryList used on /packages and layer landings."
      >
        <div className="space-y-14">
          {grouped.map((category) => (
            <LayerSection
              key={category.id}
              categoryId={category.id}
              items={category.packages}
              variant="overview"
            />
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Philosophy"
        title="Product tenets we actually ship against"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tenets.slice(0, 3).map((tenet, index) => (
            <div
              key={tenet.title}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="font-mono text-[11px] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-sm font-semibold tracking-tight">
                {tenet.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {tenet.body}
              </p>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/philosophy">
            Read the full philosophy
            <ArrowRight />
          </Link>
        </Button>
      </ContentSection>

      <ContentSection tone="card">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/story",
              title: "Our story",
              body: "Frustration at Erista, extracted into open libraries.",
            },
            {
              href: "/blog",
              title: "Blog",
              body: "Design notes and opinions on enterprise business libraries.",
            },
            {
              href: "/support",
              title: "Support & partners",
              body: "Community help, enterprise support, and consultation.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-tight group-hover:text-accent">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {item.body}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground group-hover:text-foreground">
                Explore
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
