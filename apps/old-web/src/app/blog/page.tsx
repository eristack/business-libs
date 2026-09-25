import type { Metadata } from "next";
import Link from "next/link";
import { ContentSection } from "@/components/stack/content-section";
import { PageHero } from "@/components/stack/page-hero";
import { listBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Design notes and release context from Eristack.",
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Blog
          </span>
        }
        title="Notes from the stack"
        tagline="Design decisions, domain opinions, and context behind the packages."
        description="Not a changelog dump — longer-form notes on why the libraries behave the way they do."
        actions={
          <Link
            href="/docs"
            className="text-[13px] font-semibold text-accent hover:underline"
          >
            Package docs →
          </Link>
        }
      />

      <ContentSection tone="muted">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/70 bg-card/80">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={post.href}
                className="group block px-5 py-6 transition-colors hover:bg-muted/40 sm:px-6"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>·</span>
                  <span>{post.author}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </ContentSection>
    </>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
