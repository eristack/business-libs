import { FILTER_OPS, type FilterOp, type FilterClause } from "./types.js";

export function isFilterOp(value: unknown): value is FilterOp {
  return typeof value === "string" && (FILTER_OPS as readonly string[]).includes(value);
}

export function normalizeComparable(value: unknown): unknown {
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

export function matchClause(fieldValue: unknown, clause: FilterClause): boolean {
  const { op, value } = clause;

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

  const left = normalizeComparable(fieldValue);
  const right = normalizeComparable(value);

  switch (op) {
    case "eq":
      return left === normalizeComparable(right);
    case "neq":
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
      const list = asList(value).map(normalizeComparable);
      return list.includes(normalizeComparable(fieldValue));
    }
    case "notIn": {
      const list = asList(value).map(normalizeComparable);
      return !list.includes(normalizeComparable(fieldValue));
    }
    case "between": {
      const pair = asPair(value);
      if (!pair) return false;
      const [min, max] = pair.map(normalizeComparable);
      const current = normalizeComparable(fieldValue) as number;
      return current >= (min as number) && current <= (max as number);
    }
    case "notBetween": {
      const pair = asPair(value);
      if (!pair) return true;
      const [min, max] = pair.map(normalizeComparable);
      const current = normalizeComparable(fieldValue) as number;
      return !(current >= (min as number) && current <= (max as number));
    }
    default:
      return false;
  }
}
