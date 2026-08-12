import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryHeading } from "@/components/category-heading";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { packagesByCategory, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Packages",
  description: `Open-source enterprise libraries under ${siteConfig.name}.`,
};

export default function PackagesPage() {
  const grouped = packagesByCategory();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Packages"
        title="The Eristack library stack"
        description="Each layer and each library has its own landing page — TanStack-style product pages — plus docs that live next to the code."
      />

      <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {grouped.map((category, index) => (
          <Link
            key={category.id}
            href={category.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-accent/40"
          >
            <span className="font-mono text-[10px] font-semibold text-accent tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase">
              {category.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 space-y-16">
        {grouped.map((category) => (
          <section key={category.id} className="space-y-5">
            <CategoryHeading
              categoryId={category.id}
              count={category.packages.length}
              size="lg"
            />

            <div className="divide-y divide-border border-y border-border">
              {category.packages.map((pkg) => (
                <article
                  key={pkg.slug}
                  className="grid gap-6 py-10 md:grid-cols-[1fr_auto] md:items-end"
                >
                  <div>
                    <p className="font-mono text-[12px] text-muted-foreground">
                      {pkg.name}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      <Link href={pkg.href} className="hover:text-accent">
                        {pkg.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-[15px] font-medium text-foreground/80">
                      {pkg.tagline}
                    </p>
                    <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                      {pkg.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={pkg.href}>
                        Overview
                        <ArrowRight />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={pkg.docsHref}>Docs</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
