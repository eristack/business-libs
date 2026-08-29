/** Slugs with a live hero visualization. Keep in sync with PackageHeroDemo. */
export const PACKAGE_HERO_DEMO_SLUGS = [
  "money",
  "timestamp",
  "uom",
  "percent",
  "fiscal-calendar",
  "address",
  "doc-number",
  "doc-transitions",
  "qups",
  "stock-movement",
  "financial-ledger",
  "valuations",
  "data-grid",
  "jwt-auth",
  "rbac",
  "abac",
  "pbac",
  "opinion",
  "epoch",
  "hash-chained-ledger",
  "backseat",
  "logger",
  "rest",
  "multitab",
  "ai-dev",
  "ai-knowledge",
  "ai-workflow",
  "ai-ticket-generator",
] as const;

export type PackageHeroDemoSlug = (typeof PACKAGE_HERO_DEMO_SLUGS)[number];

export function hasPackageHeroDemo(slug: string): boolean {
  return (PACKAGE_HERO_DEMO_SLUGS as readonly string[]).includes(slug);
}
