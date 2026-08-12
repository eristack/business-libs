import { InvalidOperatorError, InvalidQueryError } from "./errors.js";
import { isFilterOp } from "./match.js";
import type { DataGridSearch } from "./serialize.js";
import type {
  DataGridPage,
  DataGridQuery,
  DataGridQueryInput,
  DataGridSchema,
  FilterNode,
  PageMode,
  QueryMode,
  SortClause,
} from "./types.js";

function fieldMap(schema: DataGridSchema) {
  return new Map(schema.fields.map((field) => [field.name, field]));
}

function firstValue(input: Record<string, unknown>, key: string): unknown {
  const raw = input[key];
  if (Array.isArray(raw) && raw.length === 1) return raw[0];
  return raw;
}

function firstString(
  input: Record<string, unknown>,
  key: string,
): string | undefined {
  const raw = firstValue(input, key);
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return undefined;
}

function readJsonField(input: Record<string, unknown>, key: string): unknown {
  const raw = firstValue(input, key);
  if (raw == null || raw === "") return undefined;
  if (typeof raw === "object") return raw; // already parsed (TanStack Router)
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      throw new InvalidQueryError(`${key} must be valid JSON`);
    }
  }
  throw new InvalidQueryError(`${key} must be a JSON object or array`);
}

function toRecord(input: DataGridQueryInput): Record<string, unknown> {
  if (input == null) return {};
  if (typeof input === "string") {
    return Object.fromEntries(
      new URLSearchParams(input.startsWith("?") ? input.slice(1) : input),
    );
  }
  if (input instanceof URLSearchParams) {
    const out: Record<string, string> = {};
    for (const [key, value] of input.entries()) out[key] = value;
    return out;
  }
  return input as Record<string, unknown>;
}

function isDataGridQuery(value: unknown): value is DataGridQuery {
  return (
    typeof value === "object" &&
    value != null &&
    "mode" in value &&
    "sorts" in value &&
    "page" in value &&
    Array.isArray((value as DataGridQuery).sorts) &&
    typeof (value as DataGridQuery).page === "object" &&
    (value as DataGridQuery).page != null &&
    "mode" in (value as DataGridQuery).page
  );
}

function isDataGridSearch(value: unknown): value is DataGridSearch {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return (
    "q" in obj ||
    "filters" in obj ||
    "sorts" in obj ||
    "page" in obj ||
    "pageSize" in obj ||
    "pageMode" in obj ||
    "cursor" in obj ||
    "limit" in obj ||
    "mode" in obj
  );
}

function parseFilterNode(value: unknown, schema: DataGridSchema): FilterNode {
  if (!value || typeof value !== "object") {
    throw new InvalidQueryError("filters must be a JSON object");
  }
  const node = value as FilterNode;
  const fields = fieldMap(schema);

  function walk(n: FilterNode): FilterNode {
    if (n.type === "group") {
      if (n.logic !== "and" && n.logic !== "or") {
        throw new InvalidQueryError("Filter group logic must be and|or");
      }
      return {
        type: "group",
        logic: n.logic,
        children: (n.children ?? []).map(walk),
      };
    }
    if (n.type !== "clause") throw new InvalidQueryError("Invalid filter node");
    if (!isFilterOp(n.op)) throw new InvalidOperatorError(String(n.op));
    const def = fields.get(n.field);
    if (!def || def.filterable === false) {
      throw new InvalidQueryError(`Field "${n.field}" is not filterable`);
    }
    return n;
  }

  return walk(node);
}

function parseSorts(value: unknown, schema: DataGridSchema): SortClause[] {
  if (value == null) return [...(schema.defaultSorts ?? [])];
  if (!Array.isArray(value)) {
    throw new InvalidQueryError("sorts must be a JSON array");
  }
  const fields = fieldMap(schema);
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new InvalidQueryError("Each sort must be { field, dir }");
    }
    const { field, dir } = item as SortClause;
    if (typeof field !== "string" || !field) {
      throw new InvalidQueryError("sort.field is required");
    }
    if (dir !== "asc" && dir !== "desc") {
      throw new InvalidQueryError('sort.dir must be "asc" or "desc"');
    }
    const def = fields.get(field);
    if (!def || def.sortable === false) {
      throw new InvalidQueryError(`Field "${field}" is not sortable`);
    }
    return { field, dir };
  });
}

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function parsePageFromSearch(
  search: DataGridSearch,
  schema: DataGridSchema,
): DataGridPage {
  const max = schema.maxPageSize ?? 100;
  const fallback = schema.defaultPageSize ?? 20;
  const pageMode = search.pageMode ?? schema.defaultPageMode ?? "offset";

  if (pageMode === "cursor") {
    const limit = Math.min(
      max,
      Math.max(1, Math.floor(readNumber(search.limit, fallback))),
    );
    return {
      mode: "cursor",
      cursor: search.cursor ?? null,
      limit,
    };
  }

  return {
    mode: "offset",
    page: Math.max(1, Math.floor(readNumber(search.page, 1))),
    pageSize: Math.min(
      max,
      Math.max(1, Math.floor(readNumber(search.pageSize, fallback))),
    ),
  };
}

/**
 * Build a normalized query from a TanStack Router search object
 * (or any JSON-parsed search record).
 */
export function fromSearch(
  search: DataGridSearch | Record<string, unknown> | null | undefined,
  schema: DataGridSchema,
): DataGridQuery {
  const raw = (search ?? {}) as DataGridSearch & Record<string, unknown>;
  const modeRaw = raw.mode ?? schema.defaultMode ?? "advanced";
  if (modeRaw !== "advanced" && modeRaw !== "search") {
    throw new InvalidQueryError('mode must be "advanced" or "search"');
  }
  const mode = modeRaw as QueryMode;

  let filters: FilterNode | undefined;
  if (mode === "advanced" && raw.filters != null) {
    filters = parseFilterNode(raw.filters, schema);
  }

  return normalizeQuery(
    {
      mode,
      filters,
      search: mode === "search" ? (raw.q ?? "") : undefined,
      sorts: parseSorts(raw.sorts, schema),
      page: parsePageFromSearch(raw, schema),
    },
    schema,
  );
}

export function parseQuery(
  input: DataGridQueryInput,
  schema: DataGridSchema,
): DataGridQuery {
  if (isDataGridQuery(input)) {
    return normalizeQuery(input, schema);
  }

  if (
    input &&
    typeof input === "object" &&
    !(input instanceof URLSearchParams) &&
    !Array.isArray(input)
  ) {
    const obj = input as Record<string, unknown>;
    if (
      obj.page &&
      typeof obj.page === "object" &&
      !Array.isArray(obj.page) &&
      "mode" in (obj.page as object)
    ) {
      const partial = obj as Partial<DataGridQuery>;
      return normalizeQuery(
        {
          mode: partial.mode ?? schema.defaultMode ?? "advanced",
          filters: partial.filters,
          search: partial.search,
          sorts: partial.sorts ?? [...(schema.defaultSorts ?? [])],
          page: partial.page as DataGridPage,
        },
        schema,
      );
    }
    if (isDataGridSearch(obj)) {
      const filters =
        typeof obj.filters === "string"
          ? readJsonField(obj, "filters")
          : obj.filters;
      const sorts =
        typeof obj.sorts === "string" ? readJsonField(obj, "sorts") : obj.sorts;
      return fromSearch({ ...obj, filters, sorts } as DataGridSearch, schema);
    }
  }

  const record = toRecord(input);
  const filters = readJsonField(record, "filters");
  const sorts = readJsonField(record, "sorts");
  const pageRaw = firstValue(record, "page");
  const pageSizeRaw = firstValue(record, "pageSize");
  const limitRaw = firstValue(record, "limit");

  return fromSearch(
    {
      mode: firstString(record, "mode") as QueryMode | undefined,
      q: firstString(record, "q"),
      filters: filters as FilterNode | undefined,
      sorts: sorts as SortClause[] | undefined,
      pageMode: firstString(record, "pageMode") as PageMode | undefined,
      page:
        pageRaw == null || pageRaw === ""
          ? undefined
          : readNumber(pageRaw, 1),
      pageSize:
        pageSizeRaw == null || pageSizeRaw === ""
          ? undefined
          : readNumber(pageSizeRaw, schema.defaultPageSize ?? 20),
      cursor: firstString(record, "cursor"),
      limit:
        limitRaw == null || limitRaw === ""
          ? undefined
          : readNumber(limitRaw, schema.defaultPageSize ?? 20),
    },
    schema,
  );
}

export function normalizeQuery(
  query: DataGridQuery,
  schema: DataGridSchema,
): DataGridQuery {
  const max = schema.maxPageSize ?? 100;
  const page =
    query.page.mode === "offset"
      ? {
          mode: "offset" as const,
          page: Math.max(1, query.page.page),
          pageSize: Math.min(max, Math.max(1, query.page.pageSize)),
        }
      : {
          mode: "cursor" as const,
          cursor: query.page.cursor ?? null,
          limit: Math.min(max, Math.max(1, query.page.limit)),
        };

  return {
    mode: query.mode,
    filters: query.mode === "advanced" ? query.filters : undefined,
    search: query.mode === "search" ? query.search ?? "" : undefined,
    sorts:
      query.sorts.length > 0 ? query.sorts : [...(schema.defaultSorts ?? [])],
    page,
  };
}
