import { Money } from "@eristack/money";
import { PricingLine, type PricingLineInput } from "../line.js";
import type { ModifierSpec } from "../modifier.js";
import type { QupsInput, QupsTruthMode } from "../qups.js";
import type {
  PricingFieldValue,
  PricingLineRecord,
  PricingModifierRecord,
  PricingTaxDefaults,
} from "./types.js";

export function modifiersToRecords(
  modifiers: readonly ModifierSpec[],
  idFactory: () => string,
): PricingModifierRecord[] {
  return modifiers.map((m, position) => {
    if (m.type === "percent") {
      return {
        id: m.id ?? idFactory(),
        position,
        kind: m.kind,
        type: "percent" as const,
        percent: m.percent,
      };
    }
    return {
      id: m.id ?? idFactory(),
      position,
      kind: m.kind,
      type: "nominal" as const,
      amount: m.amount.toJSON().amount,
      currency: m.amount.currency.currencyCode,
    };
  });
}

export function recordsToModifiers(
  modifiers: readonly PricingModifierRecord[],
  fallbackCurrency: string,
): ModifierSpec[] {
  return [...modifiers]
    .sort((a, b) => a.position - b.position)
    .map((m) => {
      if (m.type === "percent") {
        return {
          id: m.id,
          kind: m.kind,
          type: "percent" as const,
          percent: m.percent ?? "0",
        };
      }
      return {
        id: m.id,
        kind: m.kind,
        type: "nominal" as const,
        amount: Money.of(m.amount ?? "0", m.currency || fallbackCurrency),
      };
    });
}

function qupsInputFromRecord(record: PricingLineRecord): QupsInput {
  const unitPrice = Money.of(record.unitPriceAmount, record.currency);
  const subtotal = Money.of(record.subtotalAmount, record.currency);
  if (record.truth === "quantity+unitPrice") {
    return {
      truth: "quantity+unitPrice",
      quantity: record.quantity,
      unitPrice,
    };
  }
  if (record.truth === "quantity+subtotal") {
    return {
      truth: "quantity+subtotal",
      quantity: record.quantity,
      subtotal,
    };
  }
  return {
    truth: "unitPrice+subtotal",
    unitPrice,
    subtotal,
  };
}

function taxFromRecord(
  record: PricingLineRecord,
): PricingLineInput["tax"] | undefined {
  if (!record.taxRatePercent) return undefined;
  if (record.taxMode === "inclusive") {
    return { ratePercent: record.taxRatePercent, mode: "inclusive" };
  }
  return { ratePercent: record.taxRatePercent, mode: "exclusive" };
}

/** Hydrate a persisted row into a live PricingLine (recomputes derived values). */
export function pricingLineFromRecord(record: PricingLineRecord): PricingLine {
  return PricingLine.of({
    qups: qupsInputFromRecord(record),
    modifiers: recordsToModifiers(record.modifiers, record.currency),
    tax: taxFromRecord(record),
  });
}

export function recordFromPricingLine(options: {
  id: string;
  ownerKey: string;
  line: PricingLine;
  profileId?: string;
  fieldValues?: PricingFieldValue[];
  position?: number;
  createdAt: Date;
  updatedAt: Date;
  idFactory: () => string;
}): PricingLineRecord {
  const { line } = options;
  const currency = line.qups.unitPrice.currency.currencyCode;
  const tax = taxOpts(line);
  return {
    id: options.id,
    ownerKey: options.ownerKey,
    profileId: options.profileId,
    truth: line.qups.truth,
    quantity: line.qups.quantity,
    quantityRatioNumerator: line.qups.quantityRatio?.numerator,
    quantityRatioDenominator: line.qups.quantityRatio?.denominator,
    currency,
    unitPriceAmount: line.qups.unitPrice.toJSON().amount,
    subtotalAmount: line.qups.subtotal.toJSON().amount,
    taxRatePercent: tax?.ratePercent,
    taxMode: tax?.mode,
    taxAmount: line.tax.tax.toJSON().amount,
    netAmount: line.tax.net.toJSON().amount,
    grossAmount: line.tax.gross.toJSON().amount,
    modifiers: modifiersToRecords(line.adjusted.modifiers, options.idFactory),
    fieldValues: options.fieldValues ?? [],
    position: options.position,
    createdAt: options.createdAt,
    updatedAt: options.updatedAt,
  };
}

function taxOpts(line: PricingLine): PricingTaxDefaults | undefined {
  if (!line.tax.ratePercent) return undefined;
  if (line.tax.truth === "gross+rate") {
    return { ratePercent: line.tax.ratePercent, mode: "inclusive" };
  }
  return { ratePercent: line.tax.ratePercent, mode: "exclusive" };
}

export function pricingLineInputFromParts(input: {
  truth: QupsTruthMode;
  currency: string;
  quantity?: string;
  unitPrice?: string;
  subtotal?: string;
  modifiers?: readonly ModifierSpec[];
  tax?: PricingTaxDefaults;
}): PricingLineInput {
  let qups: QupsInput;
  if (input.truth === "quantity+unitPrice") {
    if (input.quantity == null || input.unitPrice == null) {
      throw new Error("quantity+unitPrice requires quantity and unitPrice");
    }
    qups = {
      truth: "quantity+unitPrice",
      quantity: input.quantity,
      unitPrice: Money.of(input.unitPrice, input.currency),
    };
  } else if (input.truth === "quantity+subtotal") {
    if (input.quantity == null || input.subtotal == null) {
      throw new Error("quantity+subtotal requires quantity and subtotal");
    }
    qups = {
      truth: "quantity+subtotal",
      quantity: input.quantity,
      subtotal: Money.of(input.subtotal, input.currency),
    };
  } else {
    if (input.unitPrice == null || input.subtotal == null) {
      throw new Error("unitPrice+subtotal requires unitPrice and subtotal");
    }
    qups = {
      truth: "unitPrice+subtotal",
      unitPrice: Money.of(input.unitPrice, input.currency),
      subtotal: Money.of(input.subtotal, input.currency),
    };
  }

  return {
    qups,
    modifiers: input.modifiers,
    tax: input.tax
      ? input.tax.mode === "inclusive"
        ? { ratePercent: input.tax.ratePercent, mode: "inclusive" }
        : { ratePercent: input.tax.ratePercent, mode: "exclusive" }
      : undefined,
  };
}

/** Headless view of built-in columns + custom field values for forms/APIs. */
export function lineFieldMap(record: PricingLineRecord): Record<
  string,
  { value: string; currency?: string }
> {
  const map: Record<string, { value: string; currency?: string }> = {
    quantity: { value: record.quantity },
    unit_price: {
      value: record.unitPriceAmount,
      currency: record.currency,
    },
    subtotal: {
      value: record.subtotalAmount,
      currency: record.currency,
    },
  };
  if (record.taxRatePercent != null) {
    map.tax = { value: record.taxRatePercent };
  }
  if (record.taxAmount != null) {
    map.tax_amount = {
      value: record.taxAmount,
      currency: record.currency,
    };
  }
  if (record.netAmount != null) {
    map.net = { value: record.netAmount, currency: record.currency };
  }
  if (record.grossAmount != null) {
    map.gross = { value: record.grossAmount, currency: record.currency };
    map.total = { value: record.grossAmount, currency: record.currency };
  }
  for (const fv of record.fieldValues) {
    map[fv.fieldKey] = { value: fv.value, currency: fv.currency };
  }
  return map;
}
