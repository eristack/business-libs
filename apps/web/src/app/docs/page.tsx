import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
          description="Guides live next to each package under packages/<category>/<name>/docs. Browse by layer: primitive → capability → service → AI."
        />

        <div className="mt-12 space-y-12">
          {grouped.map((category) => (
            <section key={category.id}>
              <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {category.label}
                  </p>
                  <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {category.packages.length}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {category.packages.map((pkg) => (
                  <Link
                    key={pkg.slug}
                    href={pkg.href}
                    className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-muted-foreground/40"
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
                    <p className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-accent">
                      Open docs
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
