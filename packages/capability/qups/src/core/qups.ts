import { Money, type CurrencyUnit } from "@eristack/money";
import Decimal from "decimal.js";
import { CurrencyMismatchError, InvalidTruthError } from "./errors.js";

const QtyDecimal = Decimal.clone({
  precision: 40,
  rounding: Decimal.ROUND_HALF_EVEN,
});

/**
 * Which two of quantity / unit price / subtotal are authoritative.
 * The third is always derived.
 */
export type QupsTruthMode =
  | "quantity+unitPrice"
  | "quantity+subtotal"
  | "unitPrice+subtotal";

export type QupsInput =
  | {
      truth: "quantity+unitPrice";
      quantity: string;
      unitPrice: Money;
    }
  | {
      truth: "quantity+subtotal";
      quantity: string;
      subtotal: Money;
    }
  | {
      truth: "unitPrice+subtotal";
      unitPrice: Money;
      subtotal: Money;
    };

/** Exact quantity as a ratio of decimal strings (avoids losing 10/3). */
export type QuantityRatio = {
  numerator: string;
  denominator: string;
};

function assertQuantity(quantity: string) {
  if (quantity.trim() === "") {
    throw new InvalidTruthError("quantity is required");
  }
  try {
    // eslint-disable-next-line no-new
    new QtyDecimal(quantity);
  } catch {
    throw new InvalidTruthError(`Invalid quantity: ${quantity}`);
  }
}

function sameCurrency(a: Money, b: Money) {
  if (a.currency.currencyCode !== b.currency.currencyCode) {
    throw new CurrencyMismatchError(
      `Currency mismatch: ${a.currency.currencyCode} vs ${b.currency.currencyCode}`,
    );
  }
}

function ratioString(ratio: QuantityRatio): string {
  return new QtyDecimal(ratio.numerator).div(ratio.denominator).toFixed();
}

/**
 * Quantity · Unit price · Subtotal triad with exactly two sources of truth.
 *
 * When truth is `unitPrice+subtotal` (e.g. UP=3, S=10), quantity is kept as
 * the ratio `10/3` so the true qty is not collapsed to a rounded 3.33.
 */
export class Qups {
  readonly truth: QupsTruthMode;
  readonly unitPrice: Money;
  readonly subtotal: Money;
  /**
   * Decimal string view of quantity (high precision).
   * Prefer `quantityRatio` when truth is `unitPrice+subtotal`.
   */
  readonly quantity: string;
  /** Exact ratio when quantity was derived from unitPrice+subtotal; else null. */
  readonly quantityRatio: QuantityRatio | null;

  private constructor(
    truth: QupsTruthMode,
    quantity: string,
    unitPrice: Money,
    subtotal: Money,
    quantityRatio: QuantityRatio | null,
  ) {
    this.truth = truth;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.subtotal = subtotal;
    this.quantityRatio = quantityRatio;
  }

  get currency(): CurrencyUnit {
    return this.unitPrice.currency;
  }

  static of(input: QupsInput): Qups {
    if (input.truth === "quantity+unitPrice") {
      assertQuantity(input.quantity);
      const quantity = input.quantity.trim();
      const subtotal = input.unitPrice.multiply(quantity);
      return new Qups(
        "quantity+unitPrice",
        quantity,
        input.unitPrice,
        subtotal,
        null,
      );
    }

    if (input.truth === "quantity+subtotal") {
      assertQuantity(input.quantity);
      const quantity = input.quantity.trim();
      if (new QtyDecimal(quantity).isZero()) {
        throw new InvalidTruthError(
          "Cannot derive unitPrice when quantity is 0",
        );
      }
      const unitPrice = input.subtotal.divide(quantity);
      return new Qups(
        "quantity+subtotal",
        quantity,
        unitPrice,
        input.subtotal,
        null,
      );
    }

    sameCurrency(input.unitPrice, input.subtotal);
    if (input.unitPrice.isZero()) {
      throw new InvalidTruthError(
        "Cannot derive quantity when unitPrice is zero",
      );
    }
    const numerator = input.subtotal.getNumber().toString();
    const denominator = input.unitPrice.getNumber().toString();
    const quantityRatio = { numerator, denominator };
    return new Qups(
      "unitPrice+subtotal",
      ratioString(quantityRatio),
      input.unitPrice,
      input.subtotal,
      quantityRatio,
    );
  }

  withTruth(input: QupsInput): Qups {
    return Qups.of(input);
  }

  /**
   * `quantity × unitPrice` using SoT when possible so UP+S never drifts.
   */
  product(): Money {
    if (this.truth === "unitPrice+subtotal") return this.subtotal;
    if (this.truth === "quantity+subtotal") return this.subtotal;
    return this.unitPrice.multiply(this.quantity);
  }

  /**
   * Common UI edits. Single-field defaults:
   * - qty or unitPrice → recompute subtotal (`quantity+unitPrice`)
   * - subtotal → keep unitPrice, recompute qty (`unitPrice+subtotal`)
   *   unless `prefer: "quantity"`
   */
  edit(
    patch: {
      quantity?: string;
      unitPrice?: Money;
      subtotal?: Money;
    },
    options?: { prefer?: "quantity" | "unitPrice" },
  ): Qups {
    const prefer = options?.prefer ?? "unitPrice";
    const keys = (
      ["quantity", "unitPrice", "subtotal"] as const
    ).filter((k) => patch[k] !== undefined);

    if (keys.length === 0) return this;
    if (keys.length >= 3) {
      throw new InvalidTruthError(
        "edit() accepts at most two of quantity, unitPrice, subtotal",
      );
    }

    if (keys.length === 2) {
      if (keys.includes("quantity") && keys.includes("unitPrice")) {
        return Qups.of({
          truth: "quantity+unitPrice",
          quantity: patch.quantity!,
          unitPrice: patch.unitPrice!,
        });
      }
      if (keys.includes("quantity") && keys.includes("subtotal")) {
        return Qups.of({
          truth: "quantity+subtotal",
          quantity: patch.quantity!,
          subtotal: patch.subtotal!,
        });
      }
      return Qups.of({
        truth: "unitPrice+subtotal",
        unitPrice: patch.unitPrice!,
        subtotal: patch.subtotal!,
      });
    }

    if (patch.quantity !== undefined) {
      return Qups.of({
        truth: "quantity+unitPrice",
        quantity: patch.quantity,
        unitPrice: this.unitPrice,
      });
    }
    if (patch.unitPrice !== undefined) {
      return Qups.of({
        truth: "quantity+unitPrice",
        quantity: this.quantity,
        unitPrice: patch.unitPrice,
      });
    }
    if (prefer === "quantity") {
      return Qups.of({
        truth: "quantity+subtotal",
        quantity: this.quantity,
        subtotal: patch.subtotal!,
      });
    }
    return Qups.of({
      truth: "unitPrice+subtotal",
      unitPrice: this.unitPrice,
      subtotal: patch.subtotal!,
    });
  }

  asTruth(truth: QupsTruthMode): Qups {
    if (truth === "quantity+unitPrice") {
      return Qups.of({
        truth,
        quantity: this.quantity,
        unitPrice: this.unitPrice,
      });
    }
    if (truth === "quantity+subtotal") {
      return Qups.of({
        truth,
        quantity: this.quantity,
        subtotal: this.subtotal,
      });
    }
    return Qups.of({
      truth,
      unitPrice: this.unitPrice,
      subtotal: this.subtotal,
    });
  }

  withRounding(round: { apply: (m: Money) => Money }): Qups {
    const unitPrice = round.apply(this.unitPrice);
    const subtotal = round.apply(this.subtotal);
    if (this.truth === "quantity+unitPrice") {
      return Qups.of({
        truth: this.truth,
        quantity: this.quantity,
        unitPrice,
      });
    }
    if (this.truth === "quantity+subtotal") {
      return Qups.of({
        truth: this.truth,
        quantity: this.quantity,
        subtotal,
      });
    }
    return Qups.of({
      truth: this.truth,
      unitPrice,
      subtotal,
    });
  }

  toJSON() {
    return {
      truth: this.truth,
      quantity: this.quantity,
      quantityRatio: this.quantityRatio,
      unitPrice: this.unitPrice.toJSON(),
      subtotal: this.subtotal.toJSON(),
    };
  }
}
