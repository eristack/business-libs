import { describe, expect, it } from "vitest";
import {
  bumpLevel,
  bumpRelative,
  compareSemver,
  parseSemver,
  VersionParseError,
} from "../src/core/index.js";

describe("semver", () => {
  it("parses and formats major.minor.patch", () => {
    expect(parseSemver("0.1.0")).toEqual({ major: 0, minor: 1, patch: 0 });
    expect(bumpRelative("0.1.0", "patch")).toBe("0.1.1");
    expect(bumpRelative("0.1.1", "minor")).toBe("0.2.0");
    expect(bumpRelative("0.2.3", "major")).toBe("1.0.0");
  });

  it("rejects non-semver strings", () => {
    expect(() => parseSemver("1.0")).toThrow(VersionParseError);
    expect(() => parseSemver("v1.0.0")).toThrow(VersionParseError);
  });

  it("compareSemver orders versions", () => {
    expect(compareSemver("0.1.0", "0.1.1")).toBe(-1);
    expect(compareSemver("0.2.0", "0.1.9")).toBe(1);
    expect(compareSemver("1.0.0", "1.0.0")).toBe(0);
  });

  it("bumpLevel detects a single step", () => {
    expect(bumpLevel("0.1.0", "0.1.1")).toBe("patch");
    expect(bumpLevel("0.1.0", "0.2.0")).toBe("minor");
    expect(bumpLevel("0.1.0", "1.0.0")).toBe("major");
    expect(bumpLevel("0.1.0", "0.1.2")).toBeNull();
  });
});
