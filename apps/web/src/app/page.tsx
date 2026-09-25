import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { HistoryTimeline } from "@/components/marketing/history-timeline";
import { HomeEcosystem } from "@/components/marketing/home-ecosystem";
import { ProsCons } from "@/components/marketing/pros-cons";
import { ServicesBand } from "@/components/marketing/services-band";
import { PlatformStrip } from "@/components/marketing/platform-strip";
import { StatsBand } from "@/components/marketing/stats-band";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformStrip />
      <StatsBand />
      <ProsCons />
      <HistoryTimeline />
      <HomeEcosystem />
      <ServicesBand />
      <section className="container-page py-16 text-center sm:py-20">
        <h2 className="text-2xl font-semibold text-foreground">
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
          <a
            href={siteConfig.npmOrg}
            className="btn btn-ghost inline-flex items-center gap-2"
            target="_blank"
            rel="noreferrer"
          >
            <BrandLogo icon="npm" size={18} />
            npm org
          </a>
        </div>
      </section>
    </>
  );
}
