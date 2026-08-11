import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getDocPackages } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and API notes for Eristack packages.",
};

export default function DocsIndexPage() {
  const docPackages = getDocPackages();

  return (
    <div className="border-b border-border bg-docs-rail">
      <div className="w-full px-4 py-16 sm:px-6 xl:px-10 2xl:px-14">
        <PageHeader
          eyebrow="Docs"
          title="Documentation"
          description="Guides live next to each package under packages/*/docs. Pick a library and follow the numbered pages."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {docPackages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={pkg.href}
              className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-colors hover:border-zinc-400"
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
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
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
      </div>
    </div>
  );
}
