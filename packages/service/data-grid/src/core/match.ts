import { FILTER_OPS, type FilterOp, type FilterClause, type FieldType, type DataGridSchema } from "./types.js";
import {
  compareDecimalStrings,
  isDecimalFieldType,
} from "./decimal-compare.js";

export function isFilterOp(value: unknown): value is FilterOp {
  return typeof value === "string" && (FILTER_OPS as readonly string[]).includes(value);
}

export function fieldTypeFor(
  schema: DataGridSchema | undefined,
  fieldName: string,
): FieldType | undefined {
  return schema?.fields.find((f) => f.name === fieldName)?.type;
}

export function normalizeComparable(
  value: unknown,
  options?: { decimal?: boolean },
): unknown {
  if (options?.decimal) {
    if (value == null) return value;
    if (typeof value === "string") return value.trim();
    return String(value);
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const asNum = Number(value);
    if (value.trim() !== "" && Number.isFinite(asNum) && /^-?\d+(\.\d+)?$/.test(value.trim())) {
      return asNum;
    }
    const asDate = Date.parse(value);
    if (!Number.isNaN(asDate) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return asDate;
    }
  }
  return value;
}

function toString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split("|").map((part) => part.trim()).filter((part) => part.length > 0);
  }
  return value == null ? [] : [value];
}

function asPair(value: unknown): [unknown, unknown] | null {
  if (Array.isArray(value) && value.length >= 2) return [value[0], value[1]];
  if (typeof value === "string" && value.includes("|")) {
    const [a, b] = value.split("|", 2);
    return [a, b];
  }
  return null;
}

function compareDecimalOp(
  left: unknown,
  right: unknown,
  op: "gt" | "gte" | "lt" | "lte",
): boolean {
  const cmp = compareDecimalStrings(String(left ?? ""), String(right ?? ""));
  switch (op) {
    case "gt":
      return cmp > 0;
    case "gte":
      return cmp >= 0;
    case "lt":
      return cmp < 0;
    case "lte":
      return cmp <= 0;
  }
}

export function matchClause(
  fieldValue: unknown,
  clause: FilterClause,
  fieldType?: FieldType,
): boolean {
  const { op, value } = clause;
  const decimal = isDecimalFieldType(fieldType);

  switch (op) {
    case "isNull":
      return fieldValue == null;
    case "isNotNull":
      return fieldValue != null;
    case "isEmpty":
      return fieldValue == null || toString(fieldValue).length === 0;
    case "isNotEmpty":
      return fieldValue != null && toString(fieldValue).length > 0;
    default:
      break;
  }

  if (decimal && (op === "gt" || op === "gte" || op === "lt" || op === "lte")) {
    return compareDecimalOp(fieldValue, value, op);
  }

  const left = normalizeComparable(fieldValue, { decimal });
  const right = normalizeComparable(value, { decimal });

  switch (op) {
    case "eq":
      if (decimal) {
        return (
          compareDecimalStrings(String(fieldValue ?? ""), String(value ?? "")) ===
          0
        );
      }
      return left === normalizeComparable(right);
    case "neq":
      if (decimal) {
        return (
          compareDecimalStrings(String(fieldValue ?? ""), String(value ?? "")) !==
          0
        );
      }
      return left !== normalizeComparable(right);
    case "gt":
      return (left as number) > (normalizeComparable(right) as number);
    case "gte":
      return (left as number) >= (normalizeComparable(right) as number);
    case "lt":
      return (left as number) < (normalizeComparable(right) as number);
    case "lte":
      return (left as number) <= (normalizeComparable(right) as number);
    case "contains":
      return toString(fieldValue).toLowerCase().includes(toString(value).toLowerCase());
    case "notContains":
      return !toString(fieldValue).toLowerCase().includes(toString(value).toLowerCase());
    case "startsWith":
      return toString(fieldValue).toLowerCase().startsWith(toString(value).toLowerCase());
    case "endsWith":
      return toString(fieldValue).toLowerCase().endsWith(toString(value).toLowerCase());
    case "in": {
      const list = asList(value).map((entry) =>
        normalizeComparable(entry, { decimal }),
      );
      const current = normalizeComparable(fieldValue, { decimal });
      return list.some((entry) =>
        decimal
          ? compareDecimalStrings(String(fieldValue ?? ""), String(entry ?? "")) ===
            0
          : entry === current,
      );
    }
    case "notIn": {
      const list = asList(value).map((entry) =>
        normalizeComparable(entry, { decimal }),
      );
      const current = normalizeComparable(fieldValue, { decimal });
      return !list.some((entry) =>
        decimal
          ? compareDecimalStrings(String(fieldValue ?? ""), String(entry ?? "")) ===
            0
          : entry === current,
      );
    }
    case "between": {
      const pair = asPair(value);
      if (!pair) return false;
      if (decimal) {
        const current = String(fieldValue ?? "");
        const [min, max] = pair;
        return (
          compareDecimalOp(current, min, "gte") &&
          compareDecimalOp(current, max, "lte")
        );
      }
      const [min, max] = pair.map((v) => normalizeComparable(v));
      const current = normalizeComparable(fieldValue) as number;
      return current >= (min as number) && current <= (max as number);
    }
    case "notBetween": {
      const pair = asPair(value);
      if (!pair) return true;
      if (decimal) {
        const current = String(fieldValue ?? "");
        const [min, max] = pair;
        return !(
          compareDecimalOp(current, min, "gte") &&
          compareDecimalOp(current, max, "lte")
        );
      }
      const [min, max] = pair.map((v) => normalizeComparable(v));
      const current = normalizeComparable(fieldValue) as number;
      return !(current >= (min as number) && current <= (max as number));
    }
    default:
      return false;
  }
}
