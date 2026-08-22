/** Runtime source of truth for {@link QupsTruthMode} — do not duplicate in consumers. */
export const QUPS_TRUTH_MODES = [
  "quantity+unitPrice",
  "quantity+subtotal",
  "unitPrice+subtotal",
] as const;

export type QupsTruthMode = (typeof QUPS_TRUTH_MODES)[number];

export function isQupsTruthMode(value: unknown): value is QupsTruthMode {
  return (
    typeof value === "string" &&
    (QUPS_TRUTH_MODES as readonly string[]).includes(value)
  );
}
