/** Slugs with a live hero visualization. Keep in sync with PackageHeroDemo. */
export const PACKAGE_HERO_DEMO_SLUGS = [
  "qups",
  "rbac",
  "abac",
  "pbac",
  "data-grid",
  "ai-knowledge",
  "ai-workflow",
  "ai-ticket-generator",
] as const;

export type PackageHeroDemoSlug = (typeof PACKAGE_HERO_DEMO_SLUGS)[number];

export function hasPackageHeroDemo(slug: string): boolean {
  return (PACKAGE_HERO_DEMO_SLUGS as readonly string[]).includes(slug);
}
