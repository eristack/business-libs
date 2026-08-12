import Link from "next/link";
import { DocsPager } from "@/components/docs-pager";
import { DocsToc, extractToc } from "@/components/docs-toc";
import { Markdown } from "@/components/markdown";
import {
  docSourcePath,
  type DocMeta,
  type DocPackageSlug,
} from "@/lib/docs";
import { siteConfig } from "@/lib/site";

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

  return (
    <div className="flex gap-8 xl:gap-12">
      <article className="min-w-0 flex-1 rounded-xl border border-border bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground">
                Docs
              </Link>
              <span>/</span>
              <Link
                href={`/docs/${packageSlug}`}
                className="font-mono hover:text-foreground"
              >
                {packageName}
              </Link>
              {slug !== "index" ? (
                <>
                  <span>/</span>
                  <span className="text-foreground">{title}</span>
                </>
              ) : null}
            </div>
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-[15px] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <Markdown content={body} packageSlug={packageSlug} />
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
