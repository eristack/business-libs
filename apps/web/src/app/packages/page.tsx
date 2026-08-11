import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { packages, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Packages",
  description: `Open-source libraries under ${siteConfig.name}.`,
};

export default function PackagesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Packages"
        title="Small libraries. Clear contracts."
        description="Install what you need. Each package is independently versioned under the @eristack npm scope."
      />

      <div className="mt-12 border-t border-border">
        {packages.map((pkg) => (
          <article
            key={pkg.slug}
            className="grid gap-6 border-b border-border py-10 md:grid-cols-[1fr_auto] md:items-end"
          >
            <div>
              <p className="font-mono text-[12px] text-muted-foreground">
                {pkg.name}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {pkg.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                {pkg.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={pkg.href}>
                  Documentation
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`${siteConfig.github}/tree/main/packages/${pkg.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
