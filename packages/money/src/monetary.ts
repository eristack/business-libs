import { Money } from "./amount/money.js";
import type { CurrencyUnit, CurrencyUnitData } from "./currency/currency-unit.js";
import {
  getCurrencies,
  getCurrency,
  isCurrencyAvailable,
  registerCurrency,
  removeCurrency,
  tryGetCurrency,
} from "./currency/registry.js";
import { Rounding } from "./rounding/rounding.js";

/**
 * Accessor facade inspired by JSR 354 `Monetary`.
 */
export const Monetary = {
  getCurrency,
  tryGetCurrency,
  getCurrencies,
  isCurrencyAvailable,
  registerCurrency,
  removeCurrency,

  moneyOf(amount: string | number | bigint, currency: string | CurrencyUnit) {
    return Money.of(amount, currency);
  },

  zero(currency: string | CurrencyUnit) {
    return Money.zero(currency);
  },

  defaultRounding(currency?: string | CurrencyUnit) {
    return Rounding.currencyDefault(currency);
  },
};

export type { CurrencyUnit, CurrencyUnitData };
