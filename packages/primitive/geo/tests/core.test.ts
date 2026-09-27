import { describe, expect, it } from "vitest";

import {
  GeoParseError,
  geoDistanceKm,
  normalizeGeoPoint,
} from "../src/index.js";

describe("normalizeGeoPoint", () => {
  it("accepts valid coordinates", () => {
    expect(
      normalizeGeoPoint({ latitude: " -6.2 ", longitude: "106.8" }),
    ).toEqual({ latitude: "-6.2", longitude: "106.8" });
  });

  it("rejects out of range latitude", () => {
    expect(() =>
      normalizeGeoPoint({ latitude: "91", longitude: "0" }),
    ).toThrow(GeoParseError);
  });
});

describe("geoDistanceKm", () => {
  it("returns zero for same point", () => {
    const p = { latitude: "0", longitude: "0" };
    expect(geoDistanceKm(p, p)).toBe("0.000");
  });

  it("approximates Jakarta to Singapore", () => {
    const jakarta = { latitude: "-6.2088", longitude: "106.8456" };
    const singapore = { latitude: "1.3521", longitude: "103.8198" };
    const km = geoDistanceKm(jakarta, singapore);
    expect(Number(km)).toBeGreaterThan(800);
    expect(Number(km)).toBeLessThan(950);
  });
});
