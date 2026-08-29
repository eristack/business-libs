import { describe, expect, it } from "vitest";
import { InvalidQueryError } from "../src/core/errors.js";
import { parseDataGridNestQuery } from "../src/nest/index.js";

const schema = {
  fields: [
    { name: "status", type: "enum" as const, filterable: true, enumValues: ["open"] },
    { name: "total", type: "decimal" as const, filterable: true, sortable: true },
  ],
  defaultPageSize: 10,
  maxPageSize: 50,
};

describe("parseDataGridNestQuery", () => {
  it("parses advanced filter query objects", () => {
    const query = parseDataGridNestQuery(
      {
        mode: "advanced",
        filters: JSON.stringify({
          type: "clause",
          field: "status",
          op: "eq",
          value: "open",
        }),
      },
      schema,
    );
    expect(query.mode).toBe("advanced");
  });

  it("rejects unknown fields via InvalidQueryError", () => {
    expect(() =>
      parseDataGridNestQuery(
        {
          mode: "advanced",
          filters: JSON.stringify({
            type: "clause",
            field: "missing",
            op: "eq",
            value: "x",
          }),
        },
        schema,
      ),
    ).toThrow(InvalidQueryError);
  });

  it("rejects malformed filters JSON", () => {
    expect(() =>
      parseDataGridNestQuery(
        { mode: "advanced", filters: "{not-json" },
        schema,
      ),
    ).toThrow(InvalidQueryError);
  });

  it("coerces numeric query values to strings", () => {
    const query = parseDataGridNestQuery({ page: 2, pageSize: 10 }, schema);
    expect(query.page.mode).toBe("offset");
    if (query.page.mode === "offset") {
      expect(query.page.page).toBe(2);
    }
  });
});
