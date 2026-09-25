import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-raised">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-secondary)_22%,transparent),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_color-mix(in_srgb,var(--color-primary)_12%,transparent),transparent_50%)]" />
      <div className="container-page relative py-16 sm:py-24">
        <p className="text-sm font-medium text-primary">Open @eristack libraries</p>
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
          <Link
            href={siteConfig.github}
            className="btn btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
