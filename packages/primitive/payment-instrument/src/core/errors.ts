export class PaymentInstrumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentInstrumentError";
  }
}
