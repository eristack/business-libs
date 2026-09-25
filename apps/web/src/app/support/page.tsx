import Link from "next/link";
import { SupportTiers } from "@/components/marketing/support-tiers";
import { pageMetadata } from "@/lib/seo";
import { maintainers, siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Enterprise support & consultation",
  description:
    "Community help, enterprise support, and consultation for teams running @eristack libraries in production.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <>
      <div className="border-b border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-tertiary">Services</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
            Help when the domain actually matters
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Use the libraries freely. When money, sessions, or credentials sit on
            a critical path, we can support your team privately — or partner on
            the rollout.
          </p>
        </div>
      </div>

      <div className="container-page py-16 sm:py-20">
        <div id="enterprise" className="scroll-mt-24">
          <SupportTiers />
        </div>

        <section className="card mt-16 border-secondary/25 bg-neutral/40">
          <h2 className="text-xl font-semibold text-foreground">
            Partner with Eristack
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Integrators, platforms, and consultancies that embed or extend
            @eristack packages — co-marketing, technical enablement, and roadmap
            alignment. Tell us what you are building.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${siteConfig.partnersEmail}`}
              className="btn btn-primary"
            >
              {siteConfig.partnersEmail}
            </a>
            <Link href="/story" className="btn btn-outline">
              Read our story
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-lg font-semibold text-foreground">
            Who stewards the libraries
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {maintainers.map((person) => (
              <li key={person.name} className="card">
                <p className="font-medium text-foreground">{person.name}</p>
                <p className="text-sm text-muted">
                  {person.role} · {person.company}
                </p>
                <p className="mt-3 text-sm text-muted">{person.bio}</p>
                <a
                  href={person.website}
                  className="mt-4 inline-block text-sm text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {person.website.replace(/^https:\/\//, "")}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
