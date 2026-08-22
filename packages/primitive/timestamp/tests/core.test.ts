import { describe, expect, it } from "vitest";
import {
  compareInstant,
  equalTimestamp,
  instantOf,
  now,
  parseTimestamp,
  resetClock,
  setClock,
  TimestampGapError,
  TimestampOverlapError,
  TimestampParseError,
  timestampFromJSON,
  timestampToJSON,
  toLocalDateString,
  toLocalParts,
  validateTimestampJSON,
  wallOf,
  wallToInstantOnce,
} from "../src/index.js";
import { Temporal } from "@js-temporal/polyfill";

describe("instant mode", () => {
  it("normalizes UTC instant", () => {
    const ts = instantOf("2026-08-22T02:30:00.000Z", "Asia/Jakarta");
    expect(ts.kind).toBe("instant");
    expect(ts.instant).toBe("2026-08-22T02:30:00Z");
    expect(ts.timezone).toBe("Asia/Jakarta");
  });

  it("normalizes offset input to Z", () => {
    const ts = instantOf("2026-08-22T09:30:00+07:00", "Asia/Jakarta");
    expect(ts.instant).toBe("2026-08-22T02:30:00Z");
  });

  it("derives local date in zone", () => {
    const ts = instantOf("2026-08-22T02:30:00.000Z", "Asia/Jakarta");
    expect(toLocalDateString(ts)).toBe("2026-08-22");
    expect(toLocalParts(ts).hour).toBe(9);
  });

  it("compares timeline order", () => {
    const a = instantOf("2026-01-01T00:00:00Z", "UTC");
    const b = instantOf("2026-01-02T00:00:00Z", "UTC");
    expect(compareInstant(a, b)).toBe(-1);
    expect(compareInstant(b, a)).toBe(1);
  });
});

describe("wall mode", () => {
  it("stores local without offset", () => {
    const ts = wallOf("2026-03-30T09:00:00", "Europe/Paris");
    expect(ts).toEqual({
      kind: "wall",
      local: "2026-03-30T09:00:00",
      timezone: "Europe/Paris",
    });
  });

  it("rejects Z in wall local", () => {
    expect(() => wallOf("2026-03-30T09:00:00Z", "Europe/Paris")).toThrow(
      TimestampParseError,
    );
  });

  it("wallToInstantOnce differs for winter vs summer same wall time", () => {
    const winter = wallOf("2026-01-06T09:00:00", "Europe/Paris");
    const summer = wallOf("2026-06-15T09:00:00", "Europe/Paris");
    const winterUtc = wallToInstantOnce(winter).instant;
    const summerUtc = wallToInstantOnce(summer).instant;
    expect(winterUtc).not.toBe(summerUtc);
    expect(toLocalParts(wallToInstantOnce(winter)).hour).toBe(9);
    expect(toLocalParts(wallToInstantOnce(summer)).hour).toBe(9);
  });
});

describe("DST — America/New_York", () => {
  it("throws on spring-forward gap", () => {
    const gap = wallOf("2025-03-09T02:30:00", "America/New_York");
    expect(() => wallToInstantOnce(gap)).toThrow(TimestampGapError);
  });

  it("throws on fall-back overlap without disambiguation", () => {
    const overlap = wallOf("2026-11-01T01:30:00", "America/New_York");
    expect(() => wallToInstantOnce(overlap)).toThrow(TimestampOverlapError);
  });

  it("resolves overlap with disambiguation", () => {
    const overlap = wallOf("2026-11-01T01:30:00", "America/New_York");
    const earlier = wallToInstantOnce(overlap, { disambiguation: "earlier" });
    const later = wallToInstantOnce(overlap, { disambiguation: "later" });
    expect(earlier.instant).not.toBe(later.instant);
  });
});

describe("DST — Asia/Jakarta (no DST)", () => {
  it("resolves wall time consistently", () => {
    const ts = wallOf("2026-08-22T09:00:00", "Asia/Jakarta");
    const instant = wallToInstantOnce(ts);
    expect(toLocalParts(instant).hour).toBe(9);
  });
});

describe("wire JSON", () => {
  it("round-trips instant", () => {
    const ts = instantOf("2026-08-22T02:30:00Z", "UTC");
    const json = timestampToJSON(ts);
    expect(json).toEqual({
      kind: "instant",
      instant: "2026-08-22T02:30:00Z",
      timezone: "UTC",
    });
    expect(timestampFromJSON(json)).toEqual(ts);
  });

  it("round-trips wall", () => {
    const ts = wallOf("2026-09-15T00:00:00", "Europe/Paris");
    const json = timestampToJSON(ts);
    expect(json.kind).toBe("wall");
    expect(timestampFromJSON(json)).toEqual(ts);
  });

  it("parseTimestamp accepts wire JSON", () => {
    const parsed = parseTimestamp({
      kind: "instant",
      instant: "2026-08-22T02:30:00Z",
      timezone: "Asia/Jakarta",
    });
    expect(parsed.kind).toBe("instant");
  });

  it("validateTimestampJSON normalizes instant with offset", () => {
    const json = validateTimestampJSON({
      kind: "instant",
      instant: "2026-08-22T09:30:00+07:00",
      timezone: "Asia/Jakarta",
    });
    expect(json.instant).toBe("2026-08-22T02:30:00Z");
  });

  it("equalTimestamp distinguishes kinds", () => {
    const instant = instantOf("2026-08-22T02:30:00Z", "UTC");
    const wall = wallOf("2026-08-22T09:30:00", "Asia/Jakarta");
    expect(equalTimestamp(instant, instant)).toBe(true);
    expect(equalTimestamp(instant, wall)).toBe(false);
  });
});

describe("clock injection", () => {
  it("now() uses injected clock", () => {
    setClock(() => Temporal.Instant.from("2026-01-15T12:00:00Z"));
    expect(now("UTC").instant).toBe("2026-01-15T12:00:00Z");
    resetClock();
  });
});

describe("timezone validation", () => {
  it("rejects bare offset as timezone id", () => {
    expect(() => instantOf("2026-01-01T00:00:00Z", "+07:00")).toThrow();
  });
});
