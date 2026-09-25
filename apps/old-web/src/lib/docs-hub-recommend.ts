import { recommend } from "@eristack/ai-knowledge";

const EXAMPLES = [
  { query: "invoices, tax, and payment splits", label: "Invoices + ledger" },
  { query: "login sessions and role permissions", label: "Auth + RBAC" },
  { query: "document numbers and PO formats", label: "Doc numbers" },
  { query: "dynamic list filters and drizzle", label: "Data grid lists" },
] as const;

export function docsHubRecommendExamples() {
  return EXAMPLES.map((example) => {
    const result = recommend(example.query);
    const top = result.matches[0];
    return {
      ...example,
      recipe: top?.recipe.title ?? null,
      rationale: top?.recipe.rationale.trim() ?? null,
      packages:
        top?.recipe.packages.map((pkg) => pkg.name).slice(0, 3) ?? [],
    };
  });
}
