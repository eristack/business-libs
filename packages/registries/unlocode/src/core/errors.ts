export class UnlocodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnlocodeError";
  }
}
