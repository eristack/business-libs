import { listBlogPosts } from "@/lib/blog";
import { getDoc, getDocPackages } from "@/lib/docs";
import { stripMarkdownForSearch } from "@/lib/doc-search-text";
import {
  companyNav,
  packageCategories,
  packages,
  primaryNav,
  siteConfig,
} from "@/lib/site";

export type SearchItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  group: "Navigation" | "Libraries" | "Docs" | "Blog";
  keywords?: string;
};

/** Unified index: site nav + package docs + blog. */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  const navLinks = new Map<
    string,
    { href: string; label: string; description?: string; keywords: string[] }
  >();

  const addNavLink = (link: {
    href: string;
    label: string;
    description?: string;
  }) => {
    const existing = navLinks.get(link.href);
    if (existing) {
      if (!existing.keywords.includes(link.label)) {
        existing.keywords.push(link.label);
      }
      if (link.description && !existing.description) {
        existing.description = link.description;
      }
      return;
    }

    navLinks.set(link.href, {
      href: link.href,
      label: link.label,
      description: link.description,
      keywords: [link.label, link.description].filter(
        (value): value is string => Boolean(value),
      ),
    });
  };

  addNavLink({ href: "/", label: "Home", description: siteConfig.tagline });
  for (const link of primaryNav) addNavLink(link);
  for (const link of companyNav) addNavLink(link);

  for (const link of navLinks.values()) {
    items.push({
      id: `nav-${link.href}`,
      title: link.label,
      description: link.description,
      href: link.href,
      group: "Navigation",
      keywords: link.keywords.join(" "),
    });
  }

  for (const category of packageCategories) {
    items.push({
      id: `category-${category.id}`,
      title: `${category.label} layer`,
      description: category.tagline,
      href: category.href,
      group: "Libraries",
      keywords: `${category.label} ${category.id} ${category.description} ${category.tagline}`,
    });
  }

  for (const pkg of packages) {
    const category =
      packageCategories.find((item) => item.id === pkg.category)?.label ??
      pkg.category;
    items.push({
      id: `pkg-${pkg.slug}`,
      title: pkg.title,
      description: `${category} · ${pkg.name}`,
      href: pkg.href,
      group: "Libraries",
      keywords: `${pkg.name} ${pkg.title} ${pkg.description} ${pkg.tagline} ${category} ${pkg.category}`,
    });
    items.push({
      id: `changelog-${pkg.slug}`,
      title: `${pkg.title} · Changelog`,
      description: `Release history for ${pkg.name}`,
      href: `/${pkg.slug}/changelog`,
      group: "Libraries",
      keywords: `${pkg.name} ${pkg.title} changelog release notes version history ${category}`,
    });
  }

  for (const pkg of getDocPackages()) {
    const category =
      packageCategories.find((item) => item.id === pkg.category)?.label ??
      pkg.category;
    for (const page of pkg.pages) {
      const label = page.slug === "index" ? "Overview" : page.title;
      const doc = getDoc(pkg.slug, page.slug === "index" ? "index" : page.slug);
      const bodyText = doc ? stripMarkdownForSearch(doc.content) : "";
      items.push({
        id: `doc-${pkg.slug}-${page.slug}`,
        title: `${pkg.title} · ${label}`,
        description: page.description ?? page.sourcePath,
        href: page.href,
        group: "Docs",
        keywords: `${pkg.name} ${pkg.title} ${label} ${page.description ?? ""} ${page.sourcePath} ${category} ${pkg.category} ${bodyText}`,
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
