import { describe, expect, it } from "vitest";
import {
  createEristackSpineTables,
  dialectFlag,
  dialectStringList,
  dialectText,
} from "../src/schema/index.js";

describe("dialect columns", () => {
  it("builds pgsql and sqlite column builders", () => {
    expect(dialectText("pgsql", "name")).toBeTruthy();
    expect(dialectText("sqlite", "name")).toBeTruthy();
    expect(dialectFlag("pgsql", "active")).toBeTruthy();
    expect(dialectFlag("sqlite", "active")).toBeTruthy();
    expect(dialectStringList("pgsql", "codes")).toBeTruthy();
  });
});

describe("createEristackSpineTables", () => {
  it("returns jwt-auth, rbac, epoch, and doc-number tables", () => {
    const spine = createEristackSpineTables({ dialect: "sqlite" });
    expect(spine.jwtAuthCredentials).toBeTruthy();
    expect(spine.jwtAuthRefreshTokens).toBeTruthy();
    expect(spine.permissions).toBeTruthy();
    expect(spine.docNumberFormats).toBeTruthy();
    expect(spine.docNumberSequences).toBeTruthy();
    expect(spine.backseatDocuments).toBeUndefined();
  });

  it("optional backseat documents table", () => {
    const spine = createEristackSpineTables({
      dialect: "pgsql",
      backseatDocuments: true,
    });
    expect(spine.backseatDocuments).toBeTruthy();
  });
});
