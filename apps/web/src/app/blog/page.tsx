import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { listBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Design notes and release context from Eristack.",
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Blog"
        title="Notes from the stack"
        description="Design decisions, domain opinions, and context behind the packages — not a changelog dump."
      />

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={post.href} className="group block py-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.author}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-accent">
                {post.title}
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                {post.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
