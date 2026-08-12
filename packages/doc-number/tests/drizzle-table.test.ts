import { describe, expect, it } from "vitest";
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
} from "../src/drizzle/index.js";

describe("drizzle tables", () => {
  it("creates format + sequence tables for each dialect", () => {
    for (const dialect of ["pgsql", "mysql", "sqlite"] as const) {
      const formats = createDocNumberFormatTable(dialect);
      const sequences = createDocNumberSequenceTable(dialect);
      expect(formats).toBeTruthy();
      expect(sequences).toBeTruthy();
    }
  });
});
