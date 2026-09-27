export const PHONE_PARSE_CODE = "PHONE_PARSE" as const;

export class PhoneParseError extends Error {
  readonly code = PHONE_PARSE_CODE;
  constructor(message: string) {
    super(message);
    this.name = "PhoneParseError";
  }
}
