import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/get-started",
    "/products",
    "/story",
    "/sponsor",
    "/support",
    "/docs",
    "/blog",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const posts = listBlogPosts().map((post) => ({
    url: `${base}${post.href}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts];
}
