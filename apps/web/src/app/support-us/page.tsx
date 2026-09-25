import Link from "next/link";
import { supportUsActions } from "@/lib/relationship-content";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Support us",
  description:
    "Star, contribute, partner, or sponsor Eristack — ways to help open @eristack libraries thrive.",
  path: "/support-us",
});

export default function SupportUsPage() {
  return (
    <>
      <div className="border-b border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-primary">Community</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
            Support Eristack
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            The libraries stay open. Sustainability comes from contributors,
            partners, and teams who fund enablement when the domain work matters
            — not from paywalls on core packages.
          </p>
        </div>
      </div>

      <div className="container-page py-16 sm:py-20">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {supportUsActions.map((action) => (
            <li key={action.title} className="card flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {action.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-muted">{action.body}</p>
              <ActionCta cta={action.cta} />
            </li>
          ))}
        </ul>

        <section className="card mt-12 border-tertiary/25">
          <h2 className="text-lg font-semibold text-foreground">
            Listed on Relationship
          </h2>
          <p className="mt-2 text-sm text-muted">
            Supporting organizations appear on the Relationship page when we have
            a public partnership or stewardship story to share.
          </p>
          <Link
            href="/relationship#supporting"
            className="btn btn-outline mt-4 inline-flex text-sm"
          >
            See supporting orgs
          </Link>
        </section>

        <p className="mt-10 text-center text-sm text-muted">
          Questions?{" "}
          <a
            href={`mailto:${siteConfig.partnersEmail}`}
            className="text-primary hover:underline"
          >
            {siteConfig.partnersEmail}
          </a>
        </p>
      </div>
    </>
  );
}

function ActionCta({
  cta,
}: {
  cta: { label: string; href: string };
}) {
  const className = "btn btn-primary mt-6 w-full text-sm";
  if (cta.href.startsWith("mailto:") || cta.href.startsWith("http")) {
    return (
      <a
        href={cta.href}
        className={className}
        {...(cta.href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
      >
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
