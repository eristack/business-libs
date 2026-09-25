import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { packageCategories, packages } from "@/lib/site";
import { getPackageRelease } from "@/lib/package-meta";

export function ProductGrid() {
  return (
    <div className="space-y-16">
      {packageCategories.map((category) => {
        const inCategory = packages.filter((p) => p.category === category.id);
        if (inCategory.length === 0) return null;

        return (
          <section key={category.id}>
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-foreground">
                {category.label}
              </h2>
              <p className="mt-2 text-muted">{category.tagline}</p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inCategory.map((pkg) => {
                const release = getPackageRelease(pkg);
                return (
                  <li key={pkg.slug}>
                    <article className="card flex h-full flex-col transition-shadow hover:shadow-md hover:shadow-black/30">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">
                          {pkg.name.replace("@eristack/", "")}
                        </h3>
                        <span className="font-mono text-xs text-muted">
                          v{release.version}
                        </span>
                      </div>
                      <p className="mt-2 flex-1 text-sm text-muted">
                        {pkg.tagline}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <a
                          href={release.npmHref}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <BrandLogo icon="npm" size={14} />
                          npm
                        </a>
                        <span className="text-border">·</span>
                        <Link
                          href="/docs"
                          className="text-secondary hover:underline"
                        >
                          Docs (hub)
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
