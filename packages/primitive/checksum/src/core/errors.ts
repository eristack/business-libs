export class ChecksumParseError extends Error {
  readonly code = "CHECKSUM_PARSE_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "ChecksumParseError";
  }
}
