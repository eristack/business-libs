export class CurrencyPairParseError extends Error {
  readonly code = "CURRENCY_PAIR_PARSE_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "CurrencyPairParseError";
  }
}
