import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { RoadmapNav } from "@/components/roadmap-nav";
import {
  roadmapPrinciples,
  roadmapSections,
  roadmapStatusLegend,
} from "@/lib/roadmap";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Priority stack for @eristack libraries, infrastructure, UI, and ERP modules.",
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <RoadmapNav />
        </aside>

        <div>
          <PageHeader
            eyebrow="Roadmap"
            title="What we build next"
            description="Living priority stack in the repo — four docs, one taxonomy, one ERP backlog."
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Principles
              </h2>
              <ol className="mt-4 space-y-2.5 text-[13px] leading-6 text-muted-foreground">
                {roadmapPrinciples.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Status legend
              </h2>
              <dl className="mt-4 space-y-3">
                {roadmapStatusLegend.map((row) => (
                  <div
                    key={row.status}
                    className="grid grid-cols-[7rem_1fr] gap-3 text-[13px]"
                  >
                    <dt className="font-semibold text-foreground">
                      {row.status}
                    </dt>
                    <dd className="text-muted-foreground">{row.meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <div className="mt-12 space-y-10">
            {roadmapSections.map((section) => (
              <section key={section.id}>
                <div className="mb-4">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.slug}
                      href={link.href}
                      className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/40 hover:bg-muted/30"
                    >
                      <h3 className="text-sm font-semibold tracking-tight group-hover:text-accent">
                        {link.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                        {link.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground group-hover:text-accent">
                        Read
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-10">
            <Button asChild variant="outline">
              <a
                href={`${siteConfig.github}/tree/main/roadmap`}
                target="_blank"
                rel="noreferrer"
              >
                Edit on GitHub
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/start">Start here</Link>
            </Button>
            <Button asChild>
              <Link href="/packages">Browse libraries</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
