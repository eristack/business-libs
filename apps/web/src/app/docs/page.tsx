import Link from "next/link";
import { getDocPackages } from "@/lib/docs";
import { pageMetadata } from "@/lib/seo";
import { packageCategories } from "@/lib/site";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Documentation",
  description:
    "Package guides from the monorepo — pick a library in the sidebar, or start with Get started for agent-driven setup.",
  path: "/docs",
});

export default function DocsHubPage() {
  const docPackages = getDocPackages();
  const docSlugs = new Set(docPackages.map((pkg) => pkg.slug));

  return (
    <div className="border-b border-border">
      <div className="container-page py-14 sm:py-16">
        <p className="text-sm font-medium text-primary">Documentation</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
          Library guides
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Markdown lives next to each package under{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-sm text-secondary">
            packages/*/docs
          </code>
          . Open a library to browse pages in the sidebar — same source the site
          renders in production.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/get-started" className="btn btn-primary">
            Get started with agents
          </Link>
          <a
            href={siteConfig.github}
            className="btn btn-outline"
            target="_blank"
            rel="noreferrer"
          >
            Browse on GitHub
          </a>
        </div>
      </div>

      <div className="border-t border-border bg-surface-raised">
        <div className="container-page py-12 sm:py-16">
          <h2 className="text-lg font-semibold text-foreground">By layer</h2>
          <div className="mt-8 space-y-10">
            {packageCategories.map((category) => {
              const items = docPackages.filter(
                (pkg) => pkg.category === category.id,
              );
              if (items.length === 0) return null;

              return (
                <section key={category.id}>
                  <h3 className="text-sm font-semibold text-primary">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{category.tagline}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((pkg) => (
                      <li key={pkg.slug}>
                        <Link
                          href={`/docs/${pkg.slug}`}
                          className="block rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/30 hover:bg-surface-raised"
                        >
                          <span className="font-medium text-foreground">
                            {pkg.title}
                          </span>
                          <span className="mt-0.5 block font-mono text-[11px] text-muted">
                            {pkg.name}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            {pkg.pages.length} pages
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          {docSlugs.size === 0 ? (
            <p className="text-muted">No published docs found in the monorepo.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
