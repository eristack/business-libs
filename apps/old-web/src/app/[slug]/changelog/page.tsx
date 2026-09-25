import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { EditorialProseShell } from "@/components/editorial-prose-shell";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/stack/content-section";
import { LayerBadge } from "@/components/stack/layer-badge";
import { PageHero } from "@/components/stack/page-hero";
import { StatusBadge } from "@/components/stack/status-badge";
import {
  libraryCrumbs,
  StackChrome,
} from "@/components/stack/stack-chrome";
import { VersionBadge } from "@/components/stack/version-badge";
import {
  getPackageRelease,
  readPackageChangelog,
} from "@/lib/package-meta";
import { getPackage, packages, siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return {};
  const release = getPackageRelease(pkg);
  return {
    title: `${pkg.title} changelog · v${release.version}`,
    description: `Release history for ${pkg.name}.`,
  };
}

export default async function PackageChangelogPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const release = getPackageRelease(pkg);
  const markdown = readPackageChangelog(pkg.directory);

  return (
    <div data-layer={pkg.category}>
      <PageHero
        tone="product"
        layerId={pkg.category}
        chrome={
          <StackChrome
            crumbs={[
              ...libraryCrumbs({
                categoryId: pkg.category,
                packageSlug: pkg.slug,
              }),
              { label: "Changelog" },
            ]}
            activeLayerId={pkg.category}
            activePackageSlug={pkg.slug}
            showLayerStrip={false}
            showPackageStrip={false}
          />
        }
        eyebrow={
          <>
            <LayerBadge categoryId={pkg.category} />
            <StatusBadge status={pkg.status} size="md" />
            <VersionBadge version={release.version} size="md" />
          </>
        }
        title={`${pkg.title} changelog`}
        tagline={`Current release ${release.version.startsWith("v") ? release.version : `v${release.version}`}`}
        description={`Release notes for ${pkg.name}. Source of truth lives next to the package.`}
        actions={
          <>
            <Button asChild size="lg" variant="outline">
              <Link href={pkg.href}>
                <ArrowLeft />
                Library overview
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={pkg.docsHref}>Docs</Link>
            </Button>
            {release.githubChangelogHref ? (
              <Button asChild size="lg" variant="outline">
                <a
                  href={release.githubChangelogHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      <ContentSection tone="muted">
        {markdown ? (
          <EditorialProseShell
            meta={
              <p className="font-mono text-[11px] text-muted-foreground">
                {release.changelogPath}
              </p>
            }
          >
            <Markdown content={markdown} />
          </EditorialProseShell>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10">
            <p className="text-[15px] font-semibold tracking-tight">
              No changelog published yet
            </p>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-muted-foreground">
              {pkg.name} is at{" "}
              <span className="font-mono text-foreground">
                v{release.version}
              </span>
              . A{" "}
              <span className="font-mono">CHANGELOG.md</span> will show up here
              once the package ships release notes.
            </p>
            <p className="mt-4">
              <a
                href={`${siteConfig.github}/tree/main/${pkg.directory}`}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-semibold text-accent hover:underline"
              >
                View package source →
              </a>
            </p>
          </div>
        )}
      </ContentSection>
    </div>
  );
}
