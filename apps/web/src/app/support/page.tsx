import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { siteConfig, supportTiers } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support & partners",
  description:
    "Community help, enterprise support, and consultation for Eristack libraries.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Support & partners"
        title="Help when the domain actually matters"
        description="Use the libraries freely. When money, sessions, or credentials sit on a critical path, we can support your team privately — or partner on the rollout."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {supportTiers.map((tier) => (
          <article
            key={tier.name}
            className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {tier.name}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {tier.price}
            </p>
            <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
              {tier.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-[13px] text-prose-body">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full">
              {tier.cta.href.startsWith("mailto:") ? (
                <a href={tier.cta.href}>{tier.cta.label}</a>
              ) : (
                <a href={tier.cta.href} target="_blank" rel="noreferrer">
                  {tier.cta.label}
                </a>
              )}
            </Button>
          </article>
        ))}
      </div>

      <section className="mt-16 rounded-xl border border-border bg-zinc-900 px-6 py-8 text-zinc-100 sm:px-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Partner with Eristack
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-7 text-zinc-300">
          Integrators, platforms, and consultancies that want to embed or extend
          Eristack packages — co-marketing, technical enablement, and roadmap
          alignment. Tell us what you’re building.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href={`mailto:${siteConfig.partnersEmail}`}>
              {siteConfig.partnersEmail}
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-600 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-white"
          >
            <Link href="/philosophy">Read our tenets</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
