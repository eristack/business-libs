export class FractionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FractionParseError";
  }
}

export class FractionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FractionDomainError";
  }
}
