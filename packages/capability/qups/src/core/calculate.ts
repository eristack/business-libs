import { Money, Rounding } from "@eristack/money";
import { PricingLine } from "./line.js";
import type { ModifierKind } from "./modifier.js";
import type { QupsTruthMode, QuantityRatio } from "./qups.js";
import { qupsRolesFor } from "./stores/fields.js";

/**
 * Plain string input for forms / HTTP / BE — no Money objects required.
 * Exactly two of quantity / unitPrice / subtotal must be present per `truth`.
 */
export type CalculateLineInput = {
  truth: QupsTruthMode;
  /** Currency code for all money fields on the line. */
  currency: string;
  quantity?: string;
  unitPrice?: string;
  subtotal?: string;
  modifiers?: readonly CalculateModifierInput[];
  taxRatePercent?: string;
  taxMode?: "exclusive" | "inclusive";
  /** Round money fields with `Rounding.currencyDefault()` (typical before display/persist). */
  round?: boolean;
};

export type CalculateModifierInput =
  | {
      id?: string;
      kind: ModifierKind;
      type: "percent";
      percent: string;
    }
  | {
      id?: string;
      kind: ModifierKind;
      type: "nominal";
      amount: string;
      currency?: string;
    };

/**
 * Flat snapshot for TanStack Form state, API responses, or DB inserts.
 * All money/qty are decimal strings.
 */
export type CalculatedLine = {
  truth: QupsTruthMode;
  currency: string;
  quantity: string;
  quantityRatio: QuantityRatio | null;
  unitPrice: string;
  subtotal: string;
  discountTotal: string;
  surchargeTotal: string;
  net: string;
  taxAmount: string;
  taxRatePercent: string | null;
  taxMode: "exclusive" | "inclusive" | null;
  /** Payable gross. */
  total: string;
  /** Echo modifiers as plain strings (for form round-trip). */
  modifiers: CalculateModifierInput[];
  /** Which QUPS fields are editable vs derived for the current truth. */
  roles: ReturnType<typeof qupsRolesFor>;
  /**
   * Values shaped for injectable Drizzle columns / SQL insert
   * (`currency_unit_price`, `unit_price`, …).
   */
  columns: QupsColumnValues;
};

/** CamelCase keys matching `qupsLineColumns()` drizzle properties. */
export type QupsColumnValues = {
  truth: QupsTruthMode;
  quantity: string;
  quantityRatioNumerator: string | null;
  quantityRatioDenominator: string | null;
  currencyUnitPrice: string;
  unitPrice: string;
  currencySubtotal: string;
  subtotal: string;
  taxRatePercent: string | null;
  taxMode: "exclusive" | "inclusive" | null;
  currencyTax: string | null;
  taxAmount: string | null;
  currencyNet: string;
  net: string;
  currencyGross: string;
  gross: string;
};

export type PatchLineInput = {
  quantity?: string;
  unitPrice?: string;
  subtotal?: string;
  truth?: QupsTruthMode;
  currency?: string;
  modifiers?: readonly CalculateModifierInput[];
  taxRatePercent?: string | null;
  taxMode?: "exclusive" | "inclusive" | null;
  /**
   * When only `subtotal` changes, keep this SoT partner
   * (same as `Qups.edit` prefer).
   */
  prefer?: "quantity" | "unitPrice";
  round?: boolean;
};

function toPricingLine(input: CalculateLineInput): PricingLine {
  const { truth, currency } = input;
  let line: PricingLine;

  if (truth === "quantity+unitPrice") {
    if (input.quantity == null || input.unitPrice == null) {
      throw new Error("truth quantity+unitPrice requires quantity and unitPrice");
    }
    line = PricingLine.of({
      qups: {
        truth,
        quantity: input.quantity,
        unitPrice: Money.of(input.unitPrice, currency),
      },
      modifiers: mapModifiers(input.modifiers, currency),
      tax: taxInput(input),
    });
  } else if (truth === "quantity+subtotal") {
    if (input.quantity == null || input.subtotal == null) {
      throw new Error("truth quantity+subtotal requires quantity and subtotal");
    }
    line = PricingLine.of({
      qups: {
        truth,
        quantity: input.quantity,
        subtotal: Money.of(input.subtotal, currency),
      },
      modifiers: mapModifiers(input.modifiers, currency),
      tax: taxInput(input),
    });
  } else {
    if (input.unitPrice == null || input.subtotal == null) {
      throw new Error("truth unitPrice+subtotal requires unitPrice and subtotal");
    }
    line = PricingLine.of({
      qups: {
        truth,
        unitPrice: Money.of(input.unitPrice, currency),
        subtotal: Money.of(input.subtotal, currency),
      },
      modifiers: mapModifiers(input.modifiers, currency),
      tax: taxInput(input),
    });
  }

  return input.round ? line.withRounding(Rounding.currencyDefault()) : line;
}

function mapModifiers(
  modifiers: readonly CalculateModifierInput[] | undefined,
  currency: string,
) {
  return (modifiers ?? []).map((m) => {
    if (m.type === "percent") {
      return {
        id: m.id,
        kind: m.kind,
        type: "percent" as const,
        percent: m.percent,
      };
    }
    return {
      id: m.id,
      kind: m.kind,
      type: "nominal" as const,
      amount: Money.of(m.amount, m.currency ?? currency),
    };
  });
}

function taxInput(
  input: Pick<CalculateLineInput, "taxRatePercent" | "taxMode">,
):
  | { ratePercent: string; mode?: "exclusive" }
  | { ratePercent: string; mode: "inclusive" }
  | undefined {
  if (!input.taxRatePercent) return undefined;
  if (input.taxMode === "inclusive") {
    return { ratePercent: input.taxRatePercent, mode: "inclusive" };
  }
  return { ratePercent: input.taxRatePercent, mode: "exclusive" };
}

function snapshotFromLine(
  line: PricingLine,
  currency: string,
  taxRatePercent: string | null,
  taxMode: "exclusive" | "inclusive" | null,
): CalculatedLine {
  const amount = (m: Money) => m.toJSON().amount;
  const qtyRatio = line.qups.quantityRatio;
  const resolvedTaxMode: "exclusive" | "inclusive" | null =
    taxMode ??
    (line.tax.truth === "gross+rate"
      ? "inclusive"
      : line.tax.ratePercent
        ? "exclusive"
        : null);
  const resolvedRate = taxRatePercent ?? line.tax.ratePercent;

  const modifiers: CalculateModifierInput[] = line.adjusted.modifiers.map((m) => {
    if (m.type === "percent") {
      return {
        id: m.id,
        kind: m.kind,
        type: "percent" as const,
        percent: m.percent,
      };
    }
    return {
      id: m.id,
      kind: m.kind,
      type: "nominal" as const,
      amount: amount(m.amount),
      currency: m.amount.currency.currencyCode,
    };
  });

  return {
    truth: line.qups.truth,
    currency,
    quantity: line.qups.quantity,
    quantityRatio: qtyRatio,
    unitPrice: amount(line.qups.unitPrice),
    subtotal: amount(line.qups.subtotal),
    discountTotal: amount(line.adjusted.discountTotal),
    surchargeTotal: amount(line.adjusted.surchargeTotal),
    net: amount(line.tax.net),
    taxAmount: amount(line.tax.tax),
    taxRatePercent: resolvedRate,
    taxMode: resolvedTaxMode,
    total: amount(line.total),
    modifiers,
    roles: qupsRolesFor(line.qups.truth),
    columns: {
      truth: line.qups.truth,
      quantity: line.qups.quantity,
      quantityRatioNumerator: qtyRatio?.numerator ?? null,
      quantityRatioDenominator: qtyRatio?.denominator ?? null,
      currencyUnitPrice: currency,
      unitPrice: amount(line.qups.unitPrice),
      currencySubtotal: currency,
      subtotal: amount(line.qups.subtotal),
      taxRatePercent: resolvedRate,
      taxMode: resolvedTaxMode,
      currencyTax: currency,
      taxAmount: amount(line.tax.tax),
      currencyNet: currency,
      net: amount(line.tax.net),
      currencyGross: currency,
      gross: amount(line.total),
    },
  };
}

/**
 * Recalculate a full pricing line from plain strings.
 * Use in TanStack Form listeners and BE insert/update handlers — same function both sides.
 *
 * ```ts
 * const line = calculateLine({
 *   truth: "quantity+unitPrice",
 *   currency: "USD",
 *   quantity: "2",
 *   unitPrice: "50",
 *   modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
 *   taxRatePercent: "11",
 *   round: true,
 * });
 * // form: line.quantity, line.unitPrice, line.subtotal, line.total
 * // db:   { itemId, ...line.columns }
 * ```
 */
export function calculateLine(input: CalculateLineInput): CalculatedLine {
  const line = toPricingLine(input);
  return snapshotFromLine(
    line,
    input.currency,
    input.taxRatePercent ?? null,
    input.taxMode ?? null,
  );
}

function asCalculateInput(
  current: CalculatedLine | CalculateLineInput,
): CalculateLineInput {
  if ("columns" in current) {
    return {
      truth: current.truth,
      currency: current.currency,
      quantity: current.quantity,
      unitPrice: current.unitPrice,
      subtotal: current.subtotal,
      modifiers: current.modifiers,
      taxRatePercent: current.taxRatePercent ?? undefined,
      taxMode: current.taxMode ?? undefined,
    };
  }
  return current;
}

/**
 * Patch one or more fields and recalculate (form onChange / BE partial update).
 * Uses the same SoT edit rules as `Qups.edit` when quantity/unitPrice/subtotal change.
 */
export function patchLine(
  current: CalculatedLine | CalculateLineInput,
  patch: PatchLineInput,
): CalculatedLine {
  const base = asCalculateInput(current);
  const currency = patch.currency ?? base.currency;
  const modifiers = patch.modifiers ?? base.modifiers;
  const taxRatePercent =
    patch.taxRatePercent === null
      ? undefined
      : (patch.taxRatePercent ?? base.taxRatePercent);
  const taxMode =
    patch.taxMode === null ? undefined : (patch.taxMode ?? base.taxMode);
  const round = patch.round ?? base.round;

  const qupsChanged =
    patch.quantity !== undefined ||
    patch.unitPrice !== undefined ||
    patch.subtotal !== undefined ||
    patch.truth !== undefined;

  if (!qupsChanged) {
    return calculateLine({
      truth: patch.truth ?? base.truth,
      currency,
      quantity: base.quantity,
      unitPrice: base.unitPrice,
      subtotal: base.subtotal,
      modifiers,
      taxRatePercent,
      taxMode,
      round,
    });
  }

  let live = toPricingLine({
    ...base,
    // keep base tax while editing qups; tax applied again below
  });

  if (patch.truth && patch.truth !== live.qups.truth) {
    const q = live.qups.asTruth(patch.truth);
    live = toPricingLine({
      truth: q.truth,
      currency: base.currency,
      quantity: q.quantity,
      unitPrice: q.unitPrice.toJSON().amount,
      subtotal: q.subtotal.toJSON().amount,
      modifiers: base.modifiers,
      taxRatePercent: base.taxRatePercent,
      taxMode: base.taxMode,
    });
  }

  const editPatch: {
    quantity?: string;
    unitPrice?: Money;
    subtotal?: Money;
  } = {};
  if (patch.quantity !== undefined) editPatch.quantity = patch.quantity;
  if (patch.unitPrice !== undefined) {
    editPatch.unitPrice = Money.of(patch.unitPrice, currency);
  }
  if (patch.subtotal !== undefined) {
    editPatch.subtotal = Money.of(patch.subtotal, currency);
  }
  if (Object.keys(editPatch).length) {
    live = live.editQups(editPatch, { prefer: patch.prefer });
  }

  return calculateLine({
    truth: live.qups.truth,
    currency,
    quantity: live.qups.quantity,
    unitPrice: live.qups.unitPrice.toJSON().amount,
    subtotal: live.qups.subtotal.toJSON().amount,
    modifiers,
    taxRatePercent,
    taxMode,
    round,
  });
}

/** Merge calculated QUPS columns into an insert/update payload (with itemId, …). */
export function withQupsColumns<T extends Record<string, unknown>>(
  row: T,
  line: CalculatedLine | QupsColumnValues,
): T & QupsColumnValues {
  const columns = "columns" in line ? line.columns : line;
  return { ...row, ...columns };
}

