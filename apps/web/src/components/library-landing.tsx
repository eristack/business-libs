import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function InstallChip({ command }: { command: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 px-4 py-3 font-mono text-[13px] text-foreground">
      <code>{command}</code>
    </pre>
  );
}

function FeatureGrid({
  highlights,
}: {
  highlights: readonly { title: string; body: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {highlights.map((item, index) => (
        <div key={item.title} className="border-t border-border pt-4">
          <p className="font-mono text-[11px] text-accent tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-[15px] font-semibold tracking-tight">
            {item.title}
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export function CategoryLanding({ category }: { category: Category }) {
  const siblings = packagesByCategory().find(
    (item) => item.id === category.id,
  )!;
  const index = categoryIndex(category.id as PackageCategoryId);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-noise pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-accent uppercase">
            Layer {String(index).padStart(2, "0")} · {category.label}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {category.label}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium tracking-tight text-foreground/80">
            {category.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            {category.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#libraries">
                Browse libraries
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/packages">All layers</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Why this layer
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What belongs in {category.label}
          </h2>
          <div className="mt-10">
            <FeatureGrid highlights={category.highlights} />
          </div>
        </div>
      </section>

      <section id="libraries" className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Libraries
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            In the {category.label} layer
          </h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {siblings.packages.map((pkg) => (
              <li key={pkg.slug}>
                <Link
                  href={pkg.href}
                  className="group flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-[12px] text-muted-foreground">
                      {pkg.name}
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-tight group-hover:text-accent">
                      {pkg.title}
                    </p>
                    <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                      {pkg.tagline}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-foreground sm:self-center">
                    Overview
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function PackageLanding({ pkg }: { pkg: Package }) {
  const category = getCategory(pkg.category)!;
  const siblings = packagesByCategory().find(
    (item) => item.id === pkg.category,
  )!.packages;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-noise pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <Link
                href={category.href}
                className="font-semibold tracking-[0.14em] text-accent uppercase hover:underline"
              >
                {category.label}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-mono text-muted-foreground">{pkg.name}</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {pkg.status}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              {pkg.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium tracking-tight text-foreground/80">
              {pkg.tagline}
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
              {pkg.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={pkg.docsHref}>
                  Read the docs
                  <ArrowRight />
                </Link>
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
            </div>

            <div className="mt-8 max-w-lg">
              <InstallChip command={pkg.install} />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-zinc-900/10">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 font-mono text-[11px] text-zinc-500">
                  {pkg.sample.filename}
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-zinc-300 sm:text-[13px]">
                <code>{pkg.sample.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Highlights
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight">
            Why teams reach for {pkg.title}
          </h2>
          <div className="mt-10">
            <FeatureGrid highlights={pkg.highlights} />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
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
      </section>

      {siblings.length > 1 ? (
        <section>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Same layer
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Other {category.label} libraries
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {siblings
                .filter((item) => item.slug !== pkg.slug)
                .map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[13px] font-semibold transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {item.title}
                      <span className="font-mono text-[10px] font-normal text-muted-foreground">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
