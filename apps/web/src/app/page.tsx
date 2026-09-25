import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { HistoryTimeline } from "@/components/marketing/history-timeline";
import { ProsCons } from "@/components/marketing/pros-cons";
import { StatsBand } from "@/components/marketing/stats-band";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <ProsCons />
      <HistoryTimeline />
      <section className="container-page py-16 text-center sm:py-20">
        <h2 className="text-2xl font-semibold text-neutral">
          Ready to pick a library?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Browse by layer — primitive, capability, service, infrastructure, and
          AI tooling — with live versions from the monorepo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn btn-primary">
            Products
          </Link>
          <Link href="/blog" className="btn btn-outline">
            Read the blog
          </Link>
          <Link
            href={siteConfig.npmOrg}
            className="btn btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            npm org
          </Link>
        </div>
      </section>
    </>
  );
}
