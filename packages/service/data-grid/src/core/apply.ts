import { decodeCursor, encodeCursor } from "./cursor.js";
import {
  compareDecimalStrings,
  isDecimalFieldType,
} from "./decimal-compare.js";
import { fieldTypeFor, matchClause, normalizeComparable } from "./match.js";
import { buildDataGridResult } from "./page-info.js";
import type {
  DataGridQuery,
  DataGridResult,
  DataGridSchema,
  FieldType,
  FilterNode,
  SortClause,
} from "./types.js";

export type FieldGetter<T> = (item: T, field: string) => unknown;

function matchNode<T>(
  item: T,
  node: FilterNode,
  getField: FieldGetter<T>,
  schema: DataGridSchema,
): boolean {
  if (node.type === "clause") {
    return matchClause(
      getField(item, node.field),
      node,
      fieldTypeFor(schema, node.field),
    );
  }
  if (node.logic === "and") {
    return node.children.every((child) =>
      matchNode(item, child, getField, schema),
    );
  }
  return node.children.some((child) =>
    matchNode(item, child, getField, schema),
  );
}

function searchableFields(schema: DataGridSchema): string[] {
  return schema.fields.filter((f) => f.searchable).map((f) => f.name);
}

export function matchesQuery<T>(
  item: T,
  query: DataGridQuery,
  schema: DataGridSchema,
  getField: FieldGetter<T>,
): boolean {
  if (query.mode === "search") {
    const q = (query.search ?? "").trim().toLowerCase();
    if (!q) return true;
    const fields = searchableFields(schema);
    if (fields.length === 0) return false;
    return fields.some((field) => {
      const value = getField(item, field);
      return String(value ?? "")
        .toLowerCase()
        .includes(q);
    });
  }

  if (!query.filters) return true;
  return matchNode(item, query.filters, getField, schema);
}

function compareValues(
  a: unknown,
  b: unknown,
  dir: "asc" | "desc",
  fieldType?: FieldType,
): number {
  if (isDecimalFieldType(fieldType)) {
    const result = compareDecimalStrings(String(a ?? ""), String(b ?? ""));
    return dir === "desc" ? -result : result;
  }

  const left = normalizeComparable(a);
  const right = normalizeComparable(b);
  let result = 0;
  if (left == null && right == null) result = 0;
  else if (left == null) result = -1;
  else if (right == null) result = 1;
  else if (typeof left === "number" && typeof right === "number")
    result = left - right;
  else result = String(left).localeCompare(String(right));
  return dir === "desc" ? -result : result;
}

export function compareBySorts<T>(
  a: T,
  b: T,
  sorts: SortClause[],
  getField: FieldGetter<T>,
  schema: DataGridSchema,
): number {
  for (const sort of sorts) {
    const result = compareValues(
      getField(a, sort.field),
      getField(b, sort.field),
      sort.dir,
      fieldTypeFor(schema, sort.field),
    );
    if (result !== 0) return result;
  }
  return 0;
}

function sortKeys<T>(
  item: T,
  sorts: SortClause[],
  getField: FieldGetter<T>,
): unknown[] {
  return sorts.map((sort) => getField(item, sort.field));
}

function afterCursor<T>(
  item: T,
  cursorKeys: unknown[],
  sorts: SortClause[],
  getField: FieldGetter<T>,
  schema: DataGridSchema,
): boolean {
  for (let i = 0; i < sorts.length; i++) {
    const sort = sorts[i]!;
    const fieldType = fieldTypeFor(schema, sort.field);
    const left = normalizeComparable(getField(item, sort.field), {
      decimal: isDecimalFieldType(fieldType),
    });
    const right = normalizeComparable(cursorKeys[i], {
      decimal: isDecimalFieldType(fieldType),
    });
    const cmp = compareValues(left, right, "asc", fieldType);
    if (cmp === 0) continue;
    return sort.dir === "asc" ? cmp > 0 : cmp < 0;
  }
  return false;
}

export function applyInMemory<T>(
  items: readonly T[],
  query: DataGridQuery,
  schema: DataGridSchema,
  getField: FieldGetter<T>,
): DataGridResult<T> {
  const filtered = items.filter((item) =>
    matchesQuery(item, query, schema, getField),
  );
  const sorts =
    query.sorts.length > 0 ? query.sorts : [...(schema.defaultSorts ?? [])];
  const sorted = [...filtered].sort((a, b) =>
    compareBySorts(a, b, sorts, getField, schema),
  );

  if (query.page.mode === "offset") {
    const { page, pageSize } = query.page;
    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const slice = sorted.slice(start, start + pageSize);
    return buildDataGridResult({ items: slice, query, total });
  }

  const { limit, cursor } = query.page;
  let startIndex = 0;
  if (cursor) {
    try {
      const payload = decodeCursor(cursor);
      const idx = sorted.findIndex((item) =>
        afterCursor(item, payload.k, sorts, getField, schema),
      );
      startIndex = idx >= 0 ? idx : sorted.length;
    } catch {
      startIndex = 0;
    }
  }
  const slice = sorted.slice(startIndex, startIndex + limit);
  const hasNext = startIndex + limit < sorted.length;
  const nextCursor =
    hasNext && slice.length > 0
      ? encodeCursor({
          v: 1,
          k: sortKeys(slice[slice.length - 1]!, sorts, getField),
        })
      : null;
  return buildDataGridResult({
    items: slice,
    query,
    nextCursor,
    prevCursor: null,
    hasNext,
    hasPrev: startIndex > 0,
  });
}
