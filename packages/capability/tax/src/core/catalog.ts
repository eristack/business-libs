import { TaxCodeNotFoundError } from "./errors.js";

/** App-owned master row synced into handlers (no effective-dated schedule). */
export type TaxCatalogEntry = {
  code: string;
  ratePercent: string;
  /** Default true. Inactive rows stay resolvable for stored line codes; omit from pick lists. */
  active?: boolean;
};

export type ResolvedTaxCatalogRate = {
  code: string;
  ratePercent: string;
  active: boolean;
};

function normalizeCatalogEntry(entry: TaxCatalogEntry): ResolvedTaxCatalogRate {
  const code = entry.code.trim();
  if (!code) throw new Error("Tax catalog code cannot be empty");
  const ratePercent = entry.ratePercent.trim();
  if (!ratePercent) throw new Error(`Tax catalog ratePercent cannot be empty for code "${code}"`);
  return {
    code,
    ratePercent,
    active: entry.active !== false,
  };
}

export type TaxCatalogSource =
  | ReadonlyMap<string, ResolvedTaxCatalogRate>
  | readonly TaxCatalogEntry[];

function asTaxCatalogMap(
  catalog: TaxCatalogSource,
): ReadonlyMap<string, ResolvedTaxCatalogRate> {
  if (catalog instanceof Map) return catalog;
  return buildTaxCatalog(catalog as readonly TaxCatalogEntry[]);
}

export function buildTaxCatalog(entries: readonly TaxCatalogEntry[]): Map<string, ResolvedTaxCatalogRate> {
  const map = new Map<string, ResolvedTaxCatalogRate>();
  for (const raw of entries) {
    const entry = normalizeCatalogEntry(raw);
    map.set(entry.code, entry);
  }
  return map;
}

/**
 * Resolve a stored or picked tax code against the app catalog.
 * Unknown codes throw {@link TaxCodeNotFoundError}. Inactive codes still resolve for documents that already store them.
 */
export function resolveTaxRateFromCatalog(
  catalog: TaxCatalogSource,
  code: string,
): ResolvedTaxCatalogRate {
  const map = asTaxCatalogMap(catalog);
  const trimmed = code.trim();
  const entry = map.get(trimmed);
  if (!entry) {
    throw new TaxCodeNotFoundError(trimmed);
  }
  return entry;
}

/** Active codes only — for new line / document pickers. */
export function listTaxCodesForPick(
  catalog: TaxCatalogSource,
): ResolvedTaxCatalogRate[] {
  const map = asTaxCatalogMap(catalog);
  return [...map.values()]
    .filter((row) => row.active)
    .sort((a, b) => a.code.localeCompare(b.code));
}
