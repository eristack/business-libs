export class TaxCodeNotFoundError extends Error {
  constructor(public readonly code: string) {
    super(`Tax code not registered: ${code}`);
    this.name = "TaxCodeNotFoundError";
  }
}

export class TaxRateNotFoundError extends Error {
  constructor(
    public readonly code: string,
    public readonly asOf: string,
  ) {
    super(`No tax rate for code ${code} effective on or before ${asOf}`);
    this.name = "TaxRateNotFoundError";
  }
}
