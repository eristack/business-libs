export class RestMoneyFieldError extends Error {
  readonly path: string;
  readonly issues: readonly { path: string; message: string }[];

  constructor(path: string, message: string) {
    super(message);
    this.name = "RestMoneyFieldError";
    this.path = path;
    this.issues = [{ path, message }];
  }
}
