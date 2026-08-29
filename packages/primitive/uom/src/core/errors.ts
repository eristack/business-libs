export class UomConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UomConversionError";
  }
}
