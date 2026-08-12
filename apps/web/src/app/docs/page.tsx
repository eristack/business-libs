import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryHeading } from "@/components/category-heading";
import { PageHeader } from "@/components/page-header";
import { getDocPackages } from "@/lib/docs";
import { packageCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and API notes for Eristack packages.",
};

export default function DocsIndexPage() {
  const docPackages = getDocPackages();
  const grouped = packageCategories.map((category) => ({
    ...category,
    packages: docPackages.filter((pkg) => pkg.category === category.id),
  }));

  return (
    <div className="border-b border-border bg-docs-rail">
      <div className="w-full px-4 py-16 sm:px-6 xl:px-10 2xl:px-14">
        <PageHeader
          eyebrow="Docs"
          title="Documentation"
          description="Guides live next to each package. Prefer a library overview first? Open its product page, then dive into docs."
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
              <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                {category.packages.length}
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

              <div className="grid gap-4 md:grid-cols-2">
                {category.packages.map((pkg) => (
                  <div
                    key={pkg.slug}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[12px] text-muted-foreground">
                          {pkg.name}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight">
                          {pkg.title}
                        </h2>
                      </div>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {pkg.pages.length} pages
                      </span>
                    </div>
                    <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                      {pkg.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <Link
                        href={pkg.docsHref}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-accent"
                      >
                        Open docs
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <Link
                        href={pkg.href}
                        className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Product page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
