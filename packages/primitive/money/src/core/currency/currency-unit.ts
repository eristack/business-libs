/**
 * Minimal currency model inspired by JSR 354 CurrencyUnit.
 */
export interface CurrencyUnit {
  readonly currencyCode: string;
  readonly numericCode: number;
  readonly defaultFractionDigits: number;
}

export interface CurrencyUnitData {
  currencyCode: string;
  numericCode: number;
  defaultFractionDigits: number;
}

export class DefaultCurrencyUnit implements CurrencyUnit {
  readonly currencyCode: string;
  readonly numericCode: number;
  readonly defaultFractionDigits: number;

  constructor(data: CurrencyUnitData) {
    this.currencyCode = data.currencyCode;
    this.numericCode = data.numericCode;
    this.defaultFractionDigits = data.defaultFractionDigits;
  }

  toString(): string {
    return this.currencyCode;
  }
}
