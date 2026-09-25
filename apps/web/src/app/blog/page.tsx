import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Engineering notes on business primitives, agent-first libraries, and shipping ERP building blocks in TypeScript.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="container-page py-16 sm:py-20">
      <p className="text-sm font-medium text-secondary">Writing</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral">
        Blog
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Long-form posts for SEO and for teams evaluating @eristack — not
        changelog noise.
      </p>
      <ul className="mt-12 space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="card">
              <time
                dateTime={post.date}
                className="text-xs font-medium text-muted"
              >
                {formatDate(post.date)}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-neutral">
                <Link href={post.href} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted">{post.description}</p>
              <Link
                href={post.href}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Read post →
              </Link>
            </article>
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
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
