import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorialProseShell } from "@/components/editorial-prose-shell";
import { Markdown } from "@/components/markdown";
import { ContentSection } from "@/components/stack/content-section";
import { PageHero } from "@/components/stack/page-hero";
import { getBlogPost, listBlogPosts } from "@/lib/blog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        tone="marketing"
        eyebrow={
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-3.5" />
            Blog
          </Link>
        }
        title={post.title}
        tagline={post.description}
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.author}</span>
          </div>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/blog">All posts</Link>
          </Button>
        }
      />

      <ContentSection>
        <EditorialProseShell>
          <Markdown content={post.content} />
        </EditorialProseShell>
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
