import { describe, expect, it } from "vitest";
import {
  qupsLineColumnOptionsFromProfile,
  qupsLineColumnsFromProfile,
} from "../src/drizzle/columns-from-profile.js";

describe("qupsLineColumnsFromProfile", () => {
  it("maps profile hints to column options", () => {
    expect(
      qupsLineColumnOptionsFromProfile({
        trackPosition: true,
        linkProfile: false,
      }),
    ).toEqual({
      includeProfileId: false,
      includePosition: true,
      includeTimestamps: false,
    });
  });

  it("returns drizzle columns for sqlite", () => {
    const cols = qupsLineColumnsFromProfile("sqlite");
    expect(cols).toHaveProperty("currency");
    expect(cols).toHaveProperty("unitPriceAmount");
  });
});
