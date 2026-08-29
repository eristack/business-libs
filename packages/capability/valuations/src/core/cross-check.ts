import type { ValuationEngine, ValuationKey } from "./create-valuations.js";

export type ValuationCrossCheckResult = {
  key: ValuationKey;
  qtyOk: boolean;
  valueOk: boolean;
  ok: boolean;
};

/** Run qty + value chain verify for many valuation keys (report / audit helper). */
export async function crossCheckValuationChains(
  engine: ValuationEngine,
  keys: readonly ValuationKey[],
): Promise<Map<string, ValuationCrossCheckResult>> {
  const out = new Map<string, ValuationCrossCheckResult>();
  await Promise.all(
    keys.map(async (key) => {
      const result = await engine.verify(key);
      const id = `${key.productId}:${key.lotId ?? ""}:${key.currency}`;
      out.set(id, {
        key,
        qtyOk: result.qty,
        valueOk: result.value,
        ok: result.qty && result.value,
      });
    }),
  );
  return out;
}
