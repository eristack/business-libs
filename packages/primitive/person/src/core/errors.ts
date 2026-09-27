export const PERSON_PARSE_CODE = "PERSON_PARSE" as const;

export class PersonParseError extends Error {
  readonly code = PERSON_PARSE_CODE;

  constructor(message: string) {
    super(message);
    this.name = "PersonParseError";
  }
}
