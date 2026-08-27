import Link from "next/link";
import { DocsPager } from "@/components/docs-pager";
import { DocsToc } from "@/components/docs-toc";
import { extractToc } from "@/lib/doc-toc";
import { Markdown } from "@/components/markdown";
import {
  docSourcePath,
  type DocMeta,
  type DocPackageSlug,
} from "@/lib/docs";
import { LayerBadge } from "@/components/stack/layer-badge";
import { VersionBadge } from "@/components/stack/version-badge";
import { getPackageRelease } from "@/lib/package-meta";
import { getCategory, packages, siteConfig } from "@/lib/site";

type DocsArticleProps = {
  packageSlug: DocPackageSlug;
  packageName: string;
  title: string;
  description?: string;
  slug: string;
  content: string;
  pages: DocMeta[];
};

export async function DocsArticle({
  packageSlug,
  packageName,
  title,
  description,
  slug,
  content,
  pages,
}: DocsArticleProps) {
  const body = stripLeadingH1(content);
  const toc = extractToc(body);
  const sourcePath = docSourcePath(packageSlug, slug);
  const sourceUrl = `${siteConfig.github}/blob/main/${sourcePath}`;
  const pkg = packages.find((item) => item.slug === packageSlug);
  const category = pkg ? getCategory(pkg.category) : null;
  const release = pkg ? getPackageRelease(pkg) : null;

  return (
    <div className="flex gap-8 xl:gap-12">
      <article className="min-w-0 flex-1 rounded-xl border border-border/80 bg-card px-6 py-7 shadow-[0_1px_2px_rgba(26,24,20,0.04)] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground">
                Docs
              </Link>
              {pkg && category ? (
                <>
                  <span>/</span>
                  <span data-layer={pkg.category}>
                    <LayerBadge categoryId={pkg.category} />
                  </span>
                </>
              ) : null}
              <span>/</span>
              <Link
                href={pkg?.href ?? `/docs/${packageSlug}`}
                className="font-medium text-foreground hover:text-accent"
              >
                {pkg?.title ?? packageName}
              </Link>
              <span>/</span>
              <Link
                href={`/docs/${packageSlug}`}
                className="font-mono hover:text-foreground"
              >
                docs
              </Link>
              {slug !== "index" ? (
                <>
                  <span>/</span>
                  <span className="text-foreground">{title}</span>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {release ? (
                <VersionBadge
                  version={release.version}
                  href={release.changelogHref}
                />
              ) : null}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
                title="Package docs are the source of truth"
              >
                {sourcePath}
              </a>
            </div>
          </div>
          <h1 className="mt-4 text-[length:var(--text-h1)] font-semibold tracking-[var(--tracking-tight)] sm:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="type-lead mt-3 max-w-2xl">{description}</p>
          ) : null}
        </div>

        <div className="prose-measure">
          <Markdown content={body} packageSlug={packageSlug} />
        </div>
        <DocsPager pages={pages} currentSlug={slug} />

        <p className="mt-10 border-t border-border pt-6 text-[12px] text-muted-foreground">
          Source of truth:{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-accent hover:underline"
          >
            {sourcePath}
          </a>
          . Edit the package doc — this site renders it.
        </p>
      </article>

      <DocsToc items={toc} />
    </div>
  );
}

function stripLeadingH1(markdown: string) {
  return markdown.replace(/^#\s+.+\n+/, "");
}
