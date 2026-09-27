export class DimensionParseError extends Error {
  readonly code = "DIMENSION_PARSE_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "DimensionParseError";
  }
}
