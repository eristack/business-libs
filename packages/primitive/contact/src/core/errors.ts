export const CONTACT_PARSE_CODE = "CONTACT_PARSE" as const;

export class ContactParseError extends Error {
  readonly code = CONTACT_PARSE_CODE;
  constructor(message: string) {
    super(message);
    this.name = "ContactParseError";
  }
}
