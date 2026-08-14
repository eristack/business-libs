import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { PageHeader } from "@/components/page-header";
import { RoadmapNav } from "@/components/roadmap-nav";
import {
  adjacentRoadmapLinks,
  findRoadmapLink,
  readRoadmapMarkdown,
  roadmapLinks,
  roadmapSourcePath,
} from "@/lib/roadmap";
import { siteConfig } from "@/lib/site";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return roadmapLinks.map((link) => ({ slug: link.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = findRoadmapLink(slug);
  if (!link) return { title: "Roadmap" };
  return {
    title: `Roadmap · ${link.title}`,
    description: link.description,
  };
}

export default async function RoadmapDetailPage({ params }: Props) {
  const { slug } = await params;
  const link = findRoadmapLink(slug);
  if (!link) notFound();

  const content = readRoadmapMarkdown(slug);
  if (!content) notFound();

  const { prev, next } = adjacentRoadmapLinks(slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <RoadmapNav currentSlug={slug} />
        </aside>

        <div className="min-w-0">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-accent lg:hidden"
          >
            <ArrowLeft className="size-3.5" />
            Roadmap
          </Link>

          <PageHeader
            eyebrow="Roadmap"
            title={link.title}
            description={link.description}
          />

          <p className="mt-4 font-mono text-[11px] text-muted-foreground">
            Source:{" "}
            <a
              href={`${siteConfig.github}/blob/main/${roadmapSourcePath(slug)}.md`}
              className="text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {roadmapSourcePath(slug)}.md
            </a>
          </p>

          <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            <Markdown content={content} />
          </article>

          {(prev || next) && (
            <nav className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Previous
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-sm font-semibold group-hover:text-accent">
                    <ArrowLeft className="size-3.5" />
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="group rounded-xl border border-border p-4 text-right transition-colors hover:bg-muted/30 sm:col-start-2"
                >
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Next
                  </span>
                  <span className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold group-hover:text-accent">
                    {next.title}
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              ) : null}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
