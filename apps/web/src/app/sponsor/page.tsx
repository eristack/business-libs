import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PlatformStrip } from "@/components/marketing/platform-strip";
import { sponsorActions, sponsors } from "@/lib/sponsor-content";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Sponsors",
  description:
    "Organizations and contributors supporting Eristack — and how to sponsor open @eristack libraries.",
  path: "/sponsor",
});

const tierLabel = {
  steward: "Steward",
  partner: "Partner",
  community: "Community",
} as const;

export default function SponsorPage() {
  return (
    <>
      <div className="border-b border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-tertiary">Community</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
            Sponsors
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Eristack stays open because stewards, sponsors, and contributors
            fund the boring work — docs, adapters, releases, and agent
            knowledge — not paywalls on core packages.
          </p>
        </div>
      </div>

      <PlatformStrip />

      <div className="container-page py-16 sm:py-20">
        <h2 className="text-xl font-semibold text-foreground">
          Supporting organizations
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Public thank-you list — ask{" "}
          <a
            href={`mailto:${siteConfig.partnersEmail}`}
            className="text-primary hover:underline"
          >
            {siteConfig.partnersEmail}
          </a>{" "}
          to be listed as a partner sponsor.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {sponsors.map((entry) => (
            <li key={entry.name} className="card">
              <div className="flex items-start justify-between gap-3">
                {entry.tier ? (
                  <p className="text-xs font-semibold tracking-wide text-tertiary uppercase">
                    {tierLabel[entry.tier]}
                  </p>
                ) : (
                  <span />
                )}
                {entry.href?.includes("github.com") ? (
                  <BrandLogo icon="github" size={24} />
                ) : null}
              </div>
              <p className="mt-1 font-semibold text-foreground">
                {entry.href ? (
                  <a
                    href={entry.href}
                    className="hover:text-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {entry.name}
                  </a>
                ) : (
                  entry.name
                )}
              </p>
              <p className="mt-2 text-sm text-muted">{entry.description}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-xl font-semibold text-foreground">
          Ways to support
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {sponsorActions.map((action) => (
            <li key={action.title} className="card flex flex-col">
              <h3 className="text-lg font-semibold text-foreground">
                {action.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{action.body}</p>
              <ActionCta cta={action.cta} />
            </li>
          ))}
        </ul>

        <section className="card mt-12 border-primary/30">
          <h2 className="text-lg font-semibold text-foreground">
            Need paid support instead?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enterprise support and consultation are separate from sponsorship —
            for production SLAs and architecture pairing.
          </p>
          <Link href="/support" className="btn btn-outline mt-4 inline-flex text-sm">
            Services
          </Link>
        </section>
      </div>
    </>
  );
}

function ActionCta({ cta }: { cta: { label: string; href: string } }) {
  const className =
    "btn btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 text-sm";
  const showGithub = cta.href.includes("github.com");
  if (cta.href.startsWith("mailto:") || cta.href.startsWith("http")) {
    return (
      <a
        href={cta.href}
        className={className}
        {...(cta.href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
      >
        {showGithub ? <BrandLogo icon="github" size={18} variant="brand" /> : null}
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}
