function isMoneyJsonCandidate(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.currency === "string" && "amount" in record;
}

/** Walk a JSON body and return paths where MoneyJSON uses a JSON number amount. */
export function findJsonNumberMoneyFields(
  value: unknown,
  path = "body",
): string[] {
  const hits: string[] = [];
  if (isMoneyJsonCandidate(value) && typeof value.amount === "number") {
    hits.push(path);
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      hits.push(...findJsonNumberMoneyFields(value[index], `${path}[${index}]`));
    }
    return hits;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      hits.push(...findJsonNumberMoneyFields(child, `${path}.${key}`));
    }
  }
  return hits;
}
