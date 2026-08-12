import { Money, Discount, Markup } from "@eristack/money";
import { CurrencyMismatchError, InvalidTruthError } from "./errors.js";

export type ModifierKind = "discount" | "surcharge";

export type ModifierSpec =
  | {
      id?: string;
      kind: ModifierKind;
      type: "percent";
      /** Percent points, e.g. `"10"` for 10%. */
      percent: string;
    }
  | {
      id?: string;
      kind: ModifierKind;
      type: "nominal";
      amount: Money;
    };

export type ModifierStep = {
  spec: ModifierSpec;
  /** Absolute money effect (always ≥ 0). */
  amount: Money;
  /** Running total after this step. */
  running: Money;
};

export type AdjustedInput =
  | {
      truth: "base+modifiers";
      base: Money;
      modifiers: readonly ModifierSpec[];
    }
  | {
      /** Derive a single nominal modifier so base ± mod = net. */
      truth: "base+net";
      base: Money;
      net: Money;
      kind?: ModifierKind;
      id?: string;
    }
  | {
      /** Derive base from net by reversing modifiers (percent/nominal). */
      truth: "modifiers+net";
      net: Money;
      modifiers: readonly ModifierSpec[];
    };

function applyOne(running: Money, spec: ModifierSpec): {
  amount: Money;
  next: Money;
} {
  if (spec.type === "percent") {
    if (spec.kind === "discount") {
      const next = running.with(Discount.ofPercent(spec.percent));
      return { amount: running.subtract(next), next };
    }
    const next = running.with(Markup.ofPercent(spec.percent));
    return { amount: next.subtract(running), next };
  }

  if (spec.amount.currency.currencyCode !== running.currency.currencyCode) {
    throw new CurrencyMismatchError(
      `Modifier currency ${spec.amount.currency.currencyCode} != base ${running.currency.currencyCode}`,
    );
  }
  if (spec.kind === "discount") {
    const next = running.subtract(spec.amount);
    return { amount: spec.amount, next };
  }
  const next = running.add(spec.amount);
  return { amount: spec.amount, next };
}

function applyForward(
  base: Money,
  modifiers: readonly ModifierSpec[],
): { net: Money; steps: ModifierStep[] } {
  let running = base;
  const steps: ModifierStep[] = [];
  for (const spec of modifiers) {
    const { amount, next } = applyOne(running, spec);
    running = next;
    steps.push({ spec, amount, running });
  }
  return { net: running, steps };
}

/**
 * Reverse modifiers from net → base.
 * Nominal discounts add back; surcharges subtract; percents invert.
 */
function reverseModifiers(
  net: Money,
  modifiers: readonly ModifierSpec[],
): Money {
  let running = net;
  for (let i = modifiers.length - 1; i >= 0; i--) {
    const spec = modifiers[i]!;
    if (spec.type === "percent") {
      if (spec.kind === "discount") {
        // net = base * (1 - p/100) → base = net / (1 - p/100)
        const factor = Money.of("100", running.currency)
          .subtract(Money.of(spec.percent, running.currency))
          .divide("100")
          .getNumber()
          .toString();
        running = running.divide(factor);
      } else {
        // net = base * (1 + p/100) → base = net / (1 + p/100)
        const factor = Money.of("100", running.currency)
          .add(Money.of(spec.percent, running.currency))
          .divide("100")
          .getNumber()
          .toString();
        running = running.divide(factor);
      }
    } else if (spec.kind === "discount") {
      running = running.add(spec.amount);
    } else {
      running = running.subtract(spec.amount);
    }
  }
  return running;
}

/**
 * Base amount ↔ modifiers ↔ net, with exactly two sources of truth.
 * Supports multiple percent/nominal discounts and surcharges in order.
 */
export class AdjustedAmount {
  readonly truth: "base+modifiers" | "base+net" | "modifiers+net";
  readonly base: Money;
  readonly net: Money;
  readonly modifiers: readonly ModifierSpec[];
  readonly steps: readonly ModifierStep[];
  readonly discountTotal: Money;
  readonly surchargeTotal: Money;

  private constructor(
    truth: AdjustedAmount["truth"],
    base: Money,
    net: Money,
    modifiers: readonly ModifierSpec[],
    steps: readonly ModifierStep[],
  ) {
    this.truth = truth;
    this.base = base;
    this.net = net;
    this.modifiers = modifiers;
    this.steps = steps;

    let discountTotal = Money.zero(base.currency);
    let surchargeTotal = Money.zero(base.currency);
    for (const step of steps) {
      if (step.spec.kind === "discount") {
        discountTotal = discountTotal.add(step.amount);
      } else {
        surchargeTotal = surchargeTotal.add(step.amount);
      }
    }
    this.discountTotal = discountTotal;
    this.surchargeTotal = surchargeTotal;
  }

  static of(input: AdjustedInput): AdjustedAmount {
    if (input.truth === "base+modifiers") {
      const { net, steps } = applyForward(input.base, input.modifiers);
      return new AdjustedAmount(
        "base+modifiers",
        input.base,
        net,
        input.modifiers,
        steps,
      );
    }

    if (input.truth === "base+net") {
      sameMoneyCurrency(input.base, input.net);
      const diff = input.base.subtract(input.net);
      let kind = input.kind;
      let amount: Money;
      if (diff.isZero()) {
        kind = kind ?? "discount";
        amount = Money.zero(input.base.currency);
      } else if (diff.isPositive()) {
        kind = "discount";
        amount = diff;
      } else {
        kind = "surcharge";
        amount = diff.abs();
      }
      const modifiers: ModifierSpec[] = [
        {
          id: input.id,
          kind,
          type: "nominal",
          amount,
        },
      ];
      const { net, steps } = applyForward(input.base, modifiers);
      return new AdjustedAmount(
        "base+net",
        input.base,
        net,
        modifiers,
        steps,
      );
    }

    if (!input.modifiers.length) {
      throw new InvalidTruthError(
        "modifiers+net requires at least one modifier to reverse",
      );
    }
    const base = reverseModifiers(input.net, input.modifiers);
    const { net, steps } = applyForward(base, input.modifiers);
    return new AdjustedAmount(
      "modifiers+net",
      base,
      net,
      input.modifiers,
      steps,
    );
  }

  toJSON() {
    return {
      truth: this.truth,
      base: this.base.toJSON(),
      net: this.net.toJSON(),
      discountTotal: this.discountTotal.toJSON(),
      surchargeTotal: this.surchargeTotal.toJSON(),
      modifiers: this.modifiers.map((m) =>
        m.type === "percent"
          ? { id: m.id, kind: m.kind, type: m.type, percent: m.percent }
          : {
              id: m.id,
              kind: m.kind,
              type: m.type,
              amount: m.amount.toJSON(),
            },
      ),
    };
  }
}

function sameMoneyCurrency(a: Money, b: Money) {
  if (a.currency.currencyCode !== b.currency.currencyCode) {
    throw new CurrencyMismatchError(
      `Currency mismatch: ${a.currency.currencyCode} vs ${b.currency.currencyCode}`,
    );
  }
}
