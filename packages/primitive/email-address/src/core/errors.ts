export const EMAIL_PARSE_CODE = "EMAIL_PARSE" as const;

export class EmailParseError extends Error {
  readonly code = EMAIL_PARSE_CODE;
  constructor(message: string) {
    super(message);
    this.name = "EmailParseError";
  }
}
