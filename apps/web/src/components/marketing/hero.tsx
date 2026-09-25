import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-raised">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-secondary)_22%,transparent),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_color-mix(in_srgb,var(--color-primary)_12%,transparent),transparent_50%)]" />
      <div className="container-page relative py-16 sm:py-24">
        <p className="text-sm font-medium text-primary">
          Open-source · npm @eristack
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Enterprise building blocks TypeScript teams should not rebuild
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/products" className="btn btn-primary">
            See all products
          </Link>
          <Link href="/story" className="btn btn-outline">
            Read our story
          </Link>
          <Link href="/support" className="btn btn-ghost">
            Enterprise support
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/25"
          >
            <BrandLogo
              icon="github"
              size={22}
              className="text-[#24292f] dark:text-[#f0f6fc]"
            />
            Star on GitHub
          </a>
          <a
            href={siteConfig.npmOrg}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/25"
          >
            <BrandLogo
              icon="npm"
              size={22}
              className="text-[#c4302b] dark:text-[#cb3837]"
            />
            @eristack on npm
          </a>
        </div>
      </div>
    </section>
  );
}
