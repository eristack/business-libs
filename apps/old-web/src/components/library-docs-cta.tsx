import Link from "next/link";
import { ArrowRight, BookOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { packages } from "@/lib/site";

type Package = (typeof packages)[number];

export function packageGettingStartedHref(pkg: Package) {
  return `${pkg.docsHref}/getting-started`;
}

type LibraryDocsCtaProps = {
  pkg: Package;
  categoryLabel: string;
  categoryHref: string;
};

export function LibraryDocsCta({
  pkg,
  categoryLabel,
  categoryHref,
}: LibraryDocsCtaProps) {
  const gettingStarted = packageGettingStartedHref(pkg);

  return (
    <ContentSection tone="card">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Documentation path
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Getting started → guides → adapters
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            Guides live in{" "}
            <span className="font-mono text-[12px] text-foreground/80">
              {pkg.directory}/docs
            </span>
            . Start with wiring, then open adapter pages when you need
            Drizzle, Express, or React shells.
          </p>
          <ol className="mt-4 space-y-1.5 text-[13px] text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent">1</span>
              <Link href={gettingStarted} className="font-medium hover:text-accent">
                Getting started
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent">2</span>
              <Link href={pkg.docsHref} className="font-medium hover:text-accent">
                Full docs index
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent">3</span>
              <Link
                href="/docs/ai-knowledge/recommend"
                className="font-medium hover:text-accent"
              >
                Agent recommend skill
              </Link>
            </li>
          </ol>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button asChild size="lg" className="justify-center">
            <Link href={gettingStarted}>
              <BookOpen className="size-4" />
              Getting started
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="justify-center">
            <Link href={pkg.docsHref}>All docs</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="justify-center">
            <Link href={`/${pkg.slug}/changelog`}>
              <History className="size-4" />
              Changelog
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="justify-center">
            <Link href={categoryHref}>More in {categoryLabel}</Link>
          </Button>
        </div>
      </div>
    </ContentSection>
  );
}
