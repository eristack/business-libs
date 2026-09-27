export class BusinessCalendarParseError extends Error {
  readonly code = "BUSINESS_CALENDAR_PARSE_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "BusinessCalendarParseError";
  }
}
