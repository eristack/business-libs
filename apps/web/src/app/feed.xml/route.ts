import { listBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

export async function GET() {
  const posts = listBlogPosts();
  const base = siteConfig.url.replace(/\/$/, "");

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}${post.href}</link>
      <guid>${base}${post.href}</guid>
      <pubDate>${post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} Blog</title>
    <link>${base}/blog</link>
    <description>${escapeXml(siteConfig.description)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
