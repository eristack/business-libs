import { listBlogPosts } from "@/lib/blog";
import { getDocPackages } from "@/lib/docs";
import { companyNav, packages, primaryNav, siteConfig } from "@/lib/site";

export type SearchItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  group: "Navigation" | "Packages" | "Docs" | "Blog";
  keywords?: string;
};

/** Unified index: site nav + package docs + blog. */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  const nav = [
    { href: "/", label: "Home", description: siteConfig.tagline },
    ...primaryNav.map((link) => ({
      href: link.href,
      label: link.label,
      description: undefined as string | undefined,
    })),
    ...companyNav.map((link) => ({
      href: link.href,
      label: link.label,
      description: undefined as string | undefined,
    })),
  ];

  for (const link of nav) {
    items.push({
      id: `nav-${link.href}`,
      title: link.label,
      description: link.description,
      href: link.href,
      group: "Navigation",
      keywords: link.label,
    });
  }

  for (const pkg of packages) {
    items.push({
      id: `pkg-${pkg.slug}`,
      title: pkg.title,
      description: pkg.name,
      href: pkg.href,
      group: "Packages",
      keywords: `${pkg.name} ${pkg.title} ${pkg.description}`,
    });
  }

  for (const pkg of getDocPackages()) {
    for (const page of pkg.pages) {
      const label = page.slug === "index" ? "Overview" : page.title;
      items.push({
        id: `doc-${pkg.slug}-${page.slug}`,
        title: `${pkg.title} · ${label}`,
        description: page.description ?? page.sourcePath,
        href: page.href,
        group: "Docs",
        keywords: `${pkg.name} ${pkg.title} ${label} ${page.description ?? ""} ${page.sourcePath}`,
      });
    }
  }

  for (const post of listBlogPosts()) {
    items.push({
      id: `blog-${post.slug}`,
      title: post.title,
      description: post.description,
      href: post.href,
      group: "Blog",
      keywords: `${post.title} ${post.description} ${post.author}`,
    });
  }

  return items;
}
