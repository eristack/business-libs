import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { getBlogPost, listBlogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: post.href,
    type: "article",
    publishedTime: post.date,
    authors: [post.author],
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="container-page py-16 sm:py-20">
      <Link
        href="/blog"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Blog
      </Link>
      <header className="mt-6 max-w-3xl">
        <time dateTime={post.date} className="text-sm text-muted">
          {formatDate(post.date)} · {post.author}
        </time>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{post.description}</p>
      </header>
      <div className="mt-12 max-w-3xl">
        <Markdown content={post.content} />
      </div>
    </article>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
