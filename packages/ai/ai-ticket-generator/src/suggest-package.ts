const PACKAGE_PREFIX = "packages/";

const STACK_PACKAGE_MAP: Array<{ pattern: RegExp; packageName: string }> = [
  { pattern: /packages\/primitive\/money\//, packageName: "@eristack/money" },
  { pattern: /packages\/primitive\/timestamp\//, packageName: "@eristack/timestamp" },
  { pattern: /packages\/capability\/doc-number\//, packageName: "@eristack/doc-number" },
  { pattern: /packages\/capability\/qups\//, packageName: "@eristack/qups" },
  { pattern: /packages\/capability\/stock-movement\//, packageName: "@eristack/stock-movement" },
  { pattern: /packages\/capability\/financial-ledger\//, packageName: "@eristack/financial-ledger" },
  { pattern: /packages\/capability\/valuations\//, packageName: "@eristack/valuations" },
  { pattern: /packages\/service\/data-grid\//, packageName: "@eristack/data-grid" },
  { pattern: /packages\/service\/jwt-auth\//, packageName: "@eristack/jwt-auth" },
  { pattern: /packages\/service\/rbac\//, packageName: "@eristack/rbac" },
  { pattern: /packages\/service\/abac\//, packageName: "@eristack/abac" },
  { pattern: /packages\/service\/pbac\//, packageName: "@eristack/pbac" },
  { pattern: /packages\/service\/epoch\//, packageName: "@eristack/epoch" },
  { pattern: /packages\/service\/hash-chained-ledger\//, packageName: "@eristack/hash-chained-ledger" },
  { pattern: /packages\/infrastructure\/backseat\//, packageName: "@eristack/backseat" },
  { pattern: /packages\/ui\/multitab\//, packageName: "@eristack/multitab" },
];

/** Suggest `@eristack/*` package from a stack trace or file path line. */
export function suggestPackageFromStackTrace(text: string): string | null {
  for (const line of text.split("\n")) {
    const idx = line.indexOf(PACKAGE_PREFIX);
    if (idx === -1) continue;
    const slice = line.slice(idx);
    for (const entry of STACK_PACKAGE_MAP) {
      if (entry.pattern.test(slice)) return entry.packageName;
    }
  }
  return null;
}
