/** Parse ISO / Date values from Backseat JSON documents. */
export function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  return new Date(String(value));
}

export function asNullableDate(value: unknown): Date | null {
  if (value == null) return null;
  return asDate(value);
}
