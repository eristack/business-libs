export class RestTimestampFieldError extends Error {
  readonly path: string;
  readonly issues: readonly { path: string; message: string }[];

  constructor(path: string, message: string) {
    super(message);
    this.name = "RestTimestampFieldError";
    this.path = path;
    this.issues = [{ path, message }];
  }
}
