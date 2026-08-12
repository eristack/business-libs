import { Money, Rounding } from "@eristack/money";
import { AdjustedAmount, type ModifierSpec } from "./modifier.js";
import { Qups, type QupsInput } from "./qups.js";
import { LineTax } from "./tax.js";

export type PricingLineInput = {
  qups: QupsInput;
  /** Applied to QUPS subtotal in order. */
  modifiers?: readonly ModifierSpec[];
  tax?:
    | { ratePercent: string; mode?: "exclusive" }
    | { ratePercent: string; mode: "inclusive" };
};

/**
 * Full line: QUPS → modifiers → tax.
 * All math stays in the business layer via Money — UI only displays.
 */
export class PricingLine {
  readonly qups: Qups;
  readonly adjusted: AdjustedAmount;
  readonly tax: LineTax;
  /** Payable total (tax.gross). */
  readonly total: Money;

  private constructor(qups: Qups, adjusted: AdjustedAmount, tax: LineTax) {
    this.qups = qups;
    this.adjusted = adjusted;
    this.tax = tax;
    this.total = tax.gross;
  }

  static of(input: PricingLineInput): PricingLine {
    const qups = Qups.of(input.qups);
    const adjusted = AdjustedAmount.of({
      truth: "base+modifiers",
      base: qups.subtotal,
      modifiers: input.modifiers ?? [],
    });

    const taxInput = input.tax;
    let tax: LineTax;
    if (!taxInput) {
      tax = LineTax.of({
        truth: "net+tax",
        net: adjusted.net,
        tax: Money.zero(adjusted.net.currency),
      });
    } else if (taxInput.mode === "inclusive") {
      // Interpreting adjusted.net as inclusive gross when mode is inclusive
      tax = LineTax.of({
        truth: "gross+rate",
        gross: adjusted.net,
        ratePercent: taxInput.ratePercent,
        mode: "inclusive",
      });
    } else {
      tax = LineTax.of({
        truth: "net+rate",
        net: adjusted.net,
        ratePercent: taxInput.ratePercent,
      });
    }

    return new PricingLine(qups, adjusted, tax);
  }

  editQups(
    patch: Parameters<Qups["edit"]>[0],
    options?: Parameters<Qups["edit"]>[1],
  ): PricingLine {
    return PricingLine.of({
      qups: truthFromQups(this.qups.edit(patch, options)),
      modifiers: this.adjusted.modifiers,
      tax: taxOptsFrom(this.tax),
    });
  }

  withModifiers(modifiers: readonly ModifierSpec[]): PricingLine {
    return PricingLine.of({
      qups: truthFromQups(this.qups),
      modifiers,
      tax: taxOptsFrom(this.tax),
    });
  }

  withRounding(round = Rounding.currencyDefault()): PricingLine {
    const apply = (m: Money) => m.with(round);
    return new PricingLine(
      this.qups.withRounding({ apply }),
      AdjustedAmount.of({
        truth: "base+modifiers",
        base: apply(this.adjusted.base),
        modifiers: this.adjusted.modifiers.map((m) =>
          m.type === "nominal"
            ? { ...m, amount: apply(m.amount) }
            : m,
        ),
      }),
      this.tax.withRounding(round),
    );
  }

  toJSON() {
    return {
      qups: this.qups.toJSON(),
      adjusted: this.adjusted.toJSON(),
      tax: this.tax.toJSON(),
      total: this.total.toJSON(),
    };
  }
}

function truthFromQups(q: Qups): QupsInput {
  if (q.truth === "quantity+unitPrice") {
    return {
      truth: "quantity+unitPrice",
      quantity: q.quantity,
      unitPrice: q.unitPrice,
    };
  }
  if (q.truth === "quantity+subtotal") {
    return {
      truth: "quantity+subtotal",
      quantity: q.quantity,
      subtotal: q.subtotal,
    };
  }
  return {
    truth: "unitPrice+subtotal",
    unitPrice: q.unitPrice,
    subtotal: q.subtotal,
  };
}

function taxOptsFrom(
  tax: LineTax,
): PricingLineInput["tax"] | undefined {
  if (!tax.ratePercent) {
    if (tax.tax.isZero()) return undefined;
    return undefined;
  }
  if (tax.truth === "gross+rate") {
    return { ratePercent: tax.ratePercent, mode: "inclusive" };
  }
  return { ratePercent: tax.ratePercent, mode: "exclusive" };
}
