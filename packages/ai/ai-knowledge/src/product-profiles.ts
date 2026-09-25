import type { Recipe, RecommendationMatch } from "./types.js";

export type RecommendProductProfile = "document-lines-erp";

/** Packages not loaded by default for document-with-lines products. */
export const DOCUMENT_LINES_SUPPRESSED_PACKAGES = [
  "@eristack/stock-movement",
  "@eristack/valuations",
  "@eristack/financial-ledger",
] as const;

const EXPLICIT_INVENTORY_GL_TOKENS = [
  "inventory",
  "warehouse",
  "stock",
  "valuation",
  "fifo",
  "lifo",
  "general ledger",
  "gl posting",
  "financial ledger",
  "hash chain",
  "hash-chained",
] as const;

export function tokensExplicitlyRequestInventoryOrGl(
  tokens: string[],
): boolean {
  return tokens.some((token) =>
    EXPLICIT_INVENTORY_GL_TOKENS.some(
      (needle) => token.includes(needle) || needle.includes(token),
    ),
  );
}

export function recipeUsesSuppressedPackage(recipe: Recipe): boolean {
  return recipe.packages.some((pkg) =>
    (DOCUMENT_LINES_SUPPRESSED_PACKAGES as readonly string[]).includes(
      pkg.name,
    ),
  );
}

export function applyDocumentLinesProductProfile(
  matches: RecommendationMatch[],
  tokens: string[],
): RecommendationMatch[] {
  if (tokensExplicitlyRequestInventoryOrGl(tokens)) {
    return matches;
  }
  return matches.filter((match) => !recipeUsesSuppressedPackage(match.recipe));
}

export function documentLinesProductNote(): string {
  return (
    "Product profile document-lines-erp: suppressed default matches for " +
    DOCUMENT_LINES_SUPPRESSED_PACKAGES.join(", ") +
    ". Mention inventory/GL explicitly to opt in."
  );
}
