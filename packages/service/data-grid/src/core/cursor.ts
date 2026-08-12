export type CursorPayload = {
  v: 1;
  /** Sort key values in sort order, plus optional tie-breaker id. */
  k: unknown[];
};

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload {
  const json = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed = JSON.parse(json) as CursorPayload;
  if (parsed?.v !== 1 || !Array.isArray(parsed.k)) {
    throw new Error("Invalid cursor");
  }
  return parsed;
}
