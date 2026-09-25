import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { DocsPager } from "@/components/docs/docs-pager";
import {
  docSourcePath,
  type DocMeta,
  type DocPackageSlug,
} from "@/lib/docs";
import { getPackageRelease } from "@/lib/package-meta";
import { siteConfig } from "@/lib/site-config";
import { getCategory, packages } from "@/lib/site";

type DocsArticleProps = {
  packageSlug: DocPackageSlug;
  title: string;
  description?: string;
  slug: string;
  content: string;
  pages: DocMeta[];
};

function stripLeadingH1(content: string) {
  return content.replace(/^#\s+.+\n+/, "");
}

export async function DocsArticle({
  packageSlug,
  title,
  description,
  slug,
  content,
  pages,
}: DocsArticleProps) {
  const body = stripLeadingH1(content);
  const pkg = packages.find((item) => item.slug === packageSlug);
  const category = pkg ? getCategory(pkg.category) : null;
  const release = pkg ? getPackageRelease(pkg) : null;
  const sourcePath = docSourcePath(packageSlug, slug);
  const sourceUrl = `${siteConfig.github}/blob/main/${sourcePath}`;

  return (
    <article className="min-w-0">
      <header className="border-b border-border pb-6">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <span aria-hidden>/</span>
          {category ? (
            <>
              <span>{category.label}</span>
              <span aria-hidden>/</span>
            </>
          ) : null}
          <Link
            href={`/docs/${packageSlug}`}
            className="hover:text-foreground"
          >
            {pkg?.title ?? packageSlug}
          </Link>
          {slug !== "index" ? (
            <>
              <span aria-hidden>/</span>
              <span className="text-foreground">{title}</span>
            </>
          ) : null}
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-muted">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {release ? (
              <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-muted">
                v{release.version}
              </span>
            ) : null}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-primary hover:bg-surface-raised"
            >
              Edit on GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="docs-article-body py-8">
        <Markdown content={body} packageSlug={packageSlug} />
      </div>

      <DocsPager pages={pages} currentSlug={slug} />
    </article>
  );
}
