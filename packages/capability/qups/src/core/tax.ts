import { Money, Tax, Rounding } from "@eristack/money";
import { CurrencyMismatchError, InvalidTruthError } from "./errors.js";

export type TaxMode = "exclusive" | "inclusive";

export type TaxInput =
  | {
      /** net + rate → tax + gross (exclusive). */
      truth: "net+rate";
      net: Money;
      ratePercent: string;
      mode?: "exclusive";
    }
  | {
      /** gross + rate → net + tax (inclusive). */
      truth: "gross+rate";
      gross: Money;
      ratePercent: string;
      mode: "inclusive";
    }
  | {
      /** net + tax → gross; rate optional derived as informational string. */
      truth: "net+tax";
      net: Money;
      tax: Money;
    };

/**
 * Tax triad with two sources of truth (net/rate, gross/rate, or net/tax).
 * Uses `@eristack/money` Tax operators under the hood.
 */
export class LineTax {
  readonly truth: "net+rate" | "gross+rate" | "net+tax";
  readonly net: Money;
  readonly tax: Money;
  readonly gross: Money;
  /** Percent points when known from rate-based truth. */
  readonly ratePercent: string | null;

  private constructor(
    truth: LineTax["truth"],
    net: Money,
    tax: Money,
    gross: Money,
    ratePercent: string | null,
  ) {
    this.truth = truth;
    this.net = net;
    this.tax = tax;
    this.gross = gross;
    this.ratePercent = ratePercent;
  }

  static of(input: TaxInput): LineTax {
    if (input.truth === "net+rate") {
      const tax = input.net.with(Tax.onExclusive(input.ratePercent));
      const gross = input.net.add(tax);
      return new LineTax(
        "net+rate",
        input.net,
        tax,
        gross,
        input.ratePercent,
      );
    }

    if (input.truth === "gross+rate") {
      const net = input.gross.with(Tax.netFromInclusive(input.ratePercent));
      const tax = input.gross.with(Tax.extractFromInclusive(input.ratePercent));
      return new LineTax(
        "gross+rate",
        net,
        tax,
        input.gross,
        input.ratePercent,
      );
    }

    if (input.net.currency.currencyCode !== input.tax.currency.currencyCode) {
      throw new CurrencyMismatchError("net and tax currencies must match");
    }
    const gross = input.net.add(input.tax);
    return new LineTax("net+tax", input.net, input.tax, gross, null);
  }

  withRounding(round = Rounding.currencyDefault()): LineTax {
    return new LineTax(
      this.truth,
      this.net.with(round),
      this.tax.with(round),
      this.gross.with(round),
      this.ratePercent,
    );
  }

  toJSON() {
    return {
      truth: this.truth,
      net: this.net.toJSON(),
      tax: this.tax.toJSON(),
      gross: this.gross.toJSON(),
      ratePercent: this.ratePercent,
    };
  }
}

export function assertRate(ratePercent: string) {
  if (ratePercent.trim() === "") {
    throw new InvalidTruthError("ratePercent is required");
  }
}
