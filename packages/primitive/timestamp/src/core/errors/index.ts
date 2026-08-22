export class TimestampError extends Error {
  override name = "TimestampError";
}

export class TimestampParseError extends TimestampError {
  override name = "TimestampParseError";
}

export class TimestampGapError extends TimestampError {
  override name = "TimestampGapError";
}

export class TimestampOverlapError extends TimestampError {
  override name = "TimestampOverlapError";
}

export class InvalidTimeZoneError extends TimestampError {
  override name = "InvalidTimeZoneError";
}
