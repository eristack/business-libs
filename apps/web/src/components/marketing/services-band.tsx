import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function ServicesBand() {
  return (
    <section className="border-y border-border bg-surface-raised">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm font-medium text-tertiary">Work with us</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Open libraries — enterprise support when it counts
          </h2>
          <p className="mt-4 text-muted">
            Community docs and GitHub cover everyday integration. When ledgers,
            auth, or document flows are on your critical path, we offer private
            support, migration guidance, and hands-on consultation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card border-primary/30">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              Enterprise support
            </p>
            <p className="mt-2 text-sm text-muted">
              Priority channel, response windows, upgrade planning, and security
              coordination for production ERP and finance stacks.
            </p>
            <Link
              href="/support#enterprise"
              className="btn btn-primary mt-5 w-full text-sm"
            >
              Talk to us
            </Link>
          </div>
          <div className="card border-secondary/30">
            <p className="text-xs font-semibold tracking-wide text-secondary uppercase">
              Consultation
            </p>
            <p className="mt-2 text-sm text-muted">
              Architecture reviews, Drizzle schema pairing, adapter wiring, and
              readiness checklists for greenfield or brownfield rollouts.
            </p>
            <a
              href={`mailto:${siteConfig.partnersEmail}`}
              className="btn btn-outline mt-5 w-full text-sm"
            >
              Book a consult
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
