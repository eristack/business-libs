export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

export class CurrencyMismatchError extends MoneyError {
  readonly left: string;
  readonly right: string;

  constructor(left: string, right: string) {
    super(`Currency mismatch: ${left} vs ${right}`);
    this.name = "CurrencyMismatchError";
    this.left = left;
    this.right = right;
  }
}

export class UnknownCurrencyError extends MoneyError {
  readonly currencyCode: string;

  constructor(currencyCode: string) {
    super(`Unknown currency: ${currencyCode}`);
    this.name = "UnknownCurrencyError";
    this.currencyCode = currencyCode;
  }
}

export class ArithmeticError extends MoneyError {
  constructor(message: string) {
    super(message);
    this.name = "ArithmeticError";
  }
}

export class ParseError extends MoneyError {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}
