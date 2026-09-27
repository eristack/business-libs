export class GeoParseError extends Error {
  readonly code = "GEO_PARSE_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "GeoParseError";
  }
}
