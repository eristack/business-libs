import { describe, expect, it } from "vitest";
import {
  createAdminDivisionRegistry,
  formatSubVillageLocalCode,
  ID_ADMIN_UNIT_KIND_META,
  normalizeAdminDivisionCode,
  parseAdminDivisionCode,
  subVillageBundledRow,
} from "../src/index.js";

describe("normalizeAdminDivisionCode", () => {
  it("accepts official digit lengths", () => {
    expect(normalizeAdminDivisionCode("31")).toBe("31");
    expect(normalizeAdminDivisionCode("31.71")).toBe("3171");
    expect(normalizeAdminDivisionCode("3171010")).toBe("3171010");
    expect(normalizeAdminDivisionCode("3171010001")).toBe("3171010001");
  });

  it("parses segment prefixes", () => {
    const parsed = parseAdminDivisionCode("3171010001");
    expect(parsed.level).toBe("village");
    expect(parsed.segments).toEqual({
      province: "31",
      regency: "3171",
      district: "3171010",
      village: "3171010001",
    });
  });
});

describe("kind metadata", () => {
  it("uses English labels only", () => {
    for (const meta of Object.values(ID_ADMIN_UNIT_KIND_META)) {
      expect(meta.label).toMatch(/^[A-Za-z0-9 (),.-]+$/);
      expect(meta).not.toHaveProperty("labelId");
      expect(meta).not.toHaveProperty("labelEn");
    }
  });
});

describe("registry", () => {
  it("resolves hierarchy from bundled rows", () => {
    const reg = createAdminDivisionRegistry([
      { c: "31", n: "DKI JAKARTA", k: "province", p: null },
      { c: "3171", n: "KOTA ADM. JAKARTA SELATAN", k: "administrative_city", p: "31" },
      { c: "3171010", n: "JAGAKARSA", k: "district", p: "3171" },
      { c: "3171010001", n: "CIPEDAK", k: "urban_village", p: "3171010" },
    ]);
    expect(reg.require("3171010001").name).toBe("CIPEDAK");
    expect(reg.childrenOf("3171")).toHaveLength(1);
  });

  it("supports sub-village local codes", () => {
    const row = subVillageBundledRow({
      villageCode: "3171010001",
      kind: "neighborhood",
      localId: "03",
      name: "Block 3",
    });
    expect(row.c).toBe("3171010001.N03");
    expect(formatSubVillageLocalCode("3171010001", "hamlet", "2")).toBe(
      "3171010001.H2",
    );
  });
});
