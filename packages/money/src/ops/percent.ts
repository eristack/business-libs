import type { MonetaryAmount } from "../amount/monetary-amount.js";
import { Money, type MoneyInput } from "../amount/money.js";
import type { MonetaryOperator } from "./types.js";
import {
  inclusiveGrossDivisor,
  minusPercentFactor,
  percentFactor,
  plusPercentFactor,
} from "./factors.js";

function asMoney(amount: MonetaryAmount): Money {
  if (amount instanceof Money) return amount;
  return Money.of(amount.getNumber().toString(), amount.currency);
}

/** `amount * (percent / 100)` */
export class PercentOf implements MonetaryOperator {
  readonly percent: string;

  constructor(percent: MoneyInput) {
    this.percent = percentFactor(percent);
  }

  apply(amount: MonetaryAmount): Money {
    return asMoney(amount).multiply(this.percent);
  }
}

/** `amount * (1 - percent / 100)` — discounted net */
export class DiscountPercent implements MonetaryOperator {
  readonly percent: MoneyInput;

  constructor(percent: MoneyInput) {
    this.percent = percent;
  }

  apply(amount: MonetaryAmount): Money {
    return asMoney(amount).multiply(minusPercentFactor(this.percent));
  }
}

/** `amount * (1 + percent / 100)` — marked-up amount */
export class MarkupPercent implements MonetaryOperator {
  readonly percent: MoneyInput;

  constructor(percent: MoneyInput) {
    this.percent = percent;
  }

  apply(amount: MonetaryAmount): Money {
    return asMoney(amount).multiply(plusPercentFactor(this.percent));
  }
}

/** Tax amount on a tax-exclusive (net) base: `base * rate/100` */
export class TaxOnExclusive implements MonetaryOperator {
  readonly ratePercent: MoneyInput;

  constructor(ratePercent: MoneyInput) {
    this.ratePercent = ratePercent;
  }

  apply(amount: MonetaryAmount): Money {
    return asMoney(amount).multiply(percentFactor(this.ratePercent));
  }
}

/** Net from tax-inclusive gross: `gross / (1 + rate/100)` */
export class TaxNetFromInclusive implements MonetaryOperator {
  readonly ratePercent: MoneyInput;

  constructor(ratePercent: MoneyInput) {
    this.ratePercent = ratePercent;
  }

  apply(amount: MonetaryAmount): Money {
    return asMoney(amount).divide(inclusiveGrossDivisor(this.ratePercent));
  }
}

/** Tax portion embedded in inclusive gross: `gross - net` */
export class TaxExtractFromInclusive implements MonetaryOperator {
  readonly ratePercent: MoneyInput;

  constructor(ratePercent: MoneyInput) {
    this.ratePercent = ratePercent;
  }

  apply(amount: MonetaryAmount): Money {
    const gross = asMoney(amount);
    const net = gross.divide(inclusiveGrossDivisor(this.ratePercent));
    return gross.subtract(net);
  }
}

export const Percent = {
  /** Operator: percent of the amount (`7` means 7%). */
  of(percent: MoneyInput): PercentOf {
    return new PercentOf(percent);
  },
};

export const Discount = {
  /** Operator: reduce amount by a percent. */
  ofPercent(percent: MoneyInput): DiscountPercent {
    return new DiscountPercent(percent);
  },
};

export const Markup = {
  /** Operator: increase amount by a percent. */
  ofPercent(percent: MoneyInput): MarkupPercent {
    return new MarkupPercent(percent);
  },
};

export const Tax = {
  /** Tax amount computed on a net (exclusive) base. */
  onExclusive(ratePercent: MoneyInput): TaxOnExclusive {
    return new TaxOnExclusive(ratePercent);
  },
  /** Strip tax from an inclusive gross → net. */
  netFromInclusive(ratePercent: MoneyInput): TaxNetFromInclusive {
    return new TaxNetFromInclusive(ratePercent);
  },
  /** Extract the tax portion from an inclusive gross. */
  extractFromInclusive(ratePercent: MoneyInput): TaxExtractFromInclusive {
    return new TaxExtractFromInclusive(ratePercent);
  },
};
