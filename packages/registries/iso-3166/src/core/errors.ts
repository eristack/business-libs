export class CountryCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CountryCodeError";
  }
}
