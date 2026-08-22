import { FILTER_OPS, type FilterLogic, type FilterNode, type FilterOp, type FieldType, type DataGridFieldDef, type DataGridSchema, type DataGridQuery, type DataGridPage } from "./types.js";
import { isFilterOp } from "./match.js";

export type FilterDraftRow = {
  /** Stable UI id (not sent to the server). */
  id: string;
  field: string;
  op: FilterOp;
  /** Raw draft value — may be string from inputs until commit. */
  value?: unknown;
};

let rowId = 0;
export function createFilterRowId(): string {
  rowId += 1;
  return `fr_${rowId}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Operators that do not take a value. */
export const VALUELESS_OPS: ReadonlySet<FilterOp> = new Set([
  "isNull",
  "isNotNull",
  "isEmpty",
  "isNotEmpty",
]);

/** Suggested operators per field type (UI allow-list). */
export function suggestedOpsForType(type: FieldType): FilterOp[] {
  switch (type) {
    case "boolean":
      return ["eq", "neq", "isNull", "isNotNull"];
    case "number":
    case "decimal":
    case "money":
    case "date":
      return [
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "between",
        "notBetween",
        "in",
        "notIn",
        "isNull",
        "isNotNull",
      ];
    case "enum":
      return ["eq", "neq", "in", "notIn", "isNull", "isNotNull"];
    case "string":
    default:
      return [
        "eq",
        "neq",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
        "in",
        "notIn",
        "isEmpty",
        "isNotEmpty",
        "isNull",
        "isNotNull",
      ];
  }
}

export function filterableFields(schema: DataGridSchema): DataGridFieldDef[] {
  return schema.fields.filter((f) => f.filterable !== false);
}

export function sortableFields(schema: DataGridSchema): DataGridFieldDef[] {
  return schema.fields.filter((f) => f.sortable !== false);
}

export function fieldDef(
  schema: DataGridSchema,
  name: string,
): DataGridFieldDef | undefined {
  return schema.fields.find((f) => f.name === name);
}

export function suggestedOpsForField(
  schema: DataGridSchema,
  fieldName: string,
): FilterOp[] {
  const def = fieldDef(schema, fieldName);
  if (!def || def.filterable === false) return [];
  return suggestedOpsForType(def.type);
}

function coerceDraftValue(op: FilterOp, value: unknown): unknown {
  if (VALUELESS_OPS.has(op)) return undefined;
  if (op === "in" || op === "notIn") {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(/[,|]/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return value == null || value === "" ? [] : [value];
  }
  if (op === "between" || op === "notBetween") {
    if (Array.isArray(value) && value.length >= 2) return [value[0], value[1]];
    if (typeof value === "string" && value.includes("..")) {
      const [a, b] = value.split("..", 2);
      return [a, b];
    }
    return value;
  }
  return value;
}

/** Build a FilterNode from flat draft rows (single and/or group). */
export function filterRowsToNode(
  rows: readonly FilterDraftRow[],
  logic: FilterLogic = "and",
): FilterNode | undefined {
  const clauses: FilterNode[] = [];
  for (const row of rows) {
    if (!row.field || !isFilterOp(row.op)) continue;
    if (!VALUELESS_OPS.has(row.op)) {
      const value = coerceDraftValue(row.op, row.value);
      if (
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        continue; // incomplete row — skip on commit
      }
      clauses.push({
        type: "clause",
        field: row.field,
        op: row.op,
        value,
      });
      continue;
    }
    clauses.push({ type: "clause", field: row.field, op: row.op });
  }
  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { type: "group", logic, children: clauses };
}

/**
 * Flatten a FilterNode into draft rows for a modal editor.
 * Only top-level and/or groups are preserved; nested groups become flat children.
 */
export function nodeToFilterRows(
  node: FilterNode | undefined,
): { rows: FilterDraftRow[]; logic: FilterLogic } {
  if (!node) return { rows: [], logic: "and" };
  if (node.type === "clause") {
    return {
      rows: [
        {
          id: createFilterRowId(),
          field: node.field,
          op: node.op,
          value: node.value,
        },
      ],
      logic: "and",
    };
  }
  const rows: FilterDraftRow[] = [];
  const walk = (n: FilterNode) => {
    if (n.type === "clause") {
      rows.push({
        id: createFilterRowId(),
        field: n.field,
        op: n.op,
        value: n.value,
      });
      return;
    }
    for (const child of n.children) walk(child);
  };
  walk(node);
  return { rows, logic: node.logic };
}

export function createEmptyFilterRow(
  schema: DataGridSchema,
  partial?: Partial<Omit<FilterDraftRow, "id">>,
): FilterDraftRow {
  const fields = filterableFields(schema);
  const field = partial?.field ?? fields[0]?.name ?? "";
  const ops = field ? suggestedOpsForField(schema, field) : [...FILTER_OPS];
  const op = partial?.op ?? ops[0] ?? "eq";
  return {
    id: createFilterRowId(),
    field,
    op,
    value: partial?.value,
  };
}

/** Reset offset page to 1; clear cursor for cursor mode. */
export function resetPagination(page: DataGridPage): DataGridPage {
  if (page.mode === "offset") {
    return { ...page, page: 1 };
  }
  return { ...page, cursor: null };
}

export function withResetPagination(query: DataGridQuery): DataGridQuery {
  return { ...query, page: resetPagination(query.page) };
}

export {
  FILTER_OPS,
};
