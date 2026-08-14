import type { BackseatCollectionFilter, BackseatDocument } from "./types.js";

function queryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/** Parse json-server-style query params into a list filter. */
export function parseListFilter(
  query?: Record<string, string | string[] | undefined>,
): BackseatCollectionFilter {
  const where: Record<string, unknown> = {};
  let sort: string | undefined;
  let order: "asc" | "desc" | undefined;
  let offset: number | undefined;
  let limit: number | undefined;
  let page: number | undefined;

  for (const [key, raw] of Object.entries(query ?? {})) {
    const value = queryValue(raw);
    if (value === undefined) continue;

    if (key === "_sort") sort = value;
    else if (key === "_order") order = value.toLowerCase() === "desc" ? "desc" : "asc";
    else if (key === "_limit") limit = Number(value);
    else if (key === "_offset") offset = Number(value);
    else if (key === "_page") page = Number(value);
    else if (!key.startsWith("_")) where[key] = value;
  }

  if (page !== undefined) {
    const pageSize = limit ?? 10;
    offset = Math.max(0, (page - 1) * pageSize);
    if (limit === undefined) limit = pageSize;
  }

  return { where, sort, order, offset, limit };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function applyCollectionFilter(
  docs: BackseatDocument[],
  filter?: BackseatCollectionFilter,
): BackseatDocument[] {
  if (!filter) return [...docs];

  let result = [...docs];

  if (filter?.where && Object.keys(filter.where).length > 0) {
    result = result.filter((doc) =>
      Object.entries(filter.where!).every(([key, expected]) => {
        const actual = doc[key];
        if (expected === undefined) return true;
        return String(actual) === String(expected);
      }),
    );
  }

  if (filter?.sort) {
    const field = filter.sort;
    const order = filter.order ?? "asc";
    result.sort((left, right) => {
      const cmp = compareValues(left[field], right[field]);
      return order === "desc" ? -cmp : cmp;
    });
  }

  if (filter.offset !== undefined && filter.offset > 0) {
    result = result.slice(filter.offset);
  }

  if (filter.limit !== undefined && filter.limit >= 0) {
    result = result.slice(0, filter.limit);
  }

  return result;
}
