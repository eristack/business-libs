import { describe, expect, it } from "vitest";
import { equalTimestamp, instantOf, wallOf } from "../src/index.js";
import {
  instantField,
  packInstant,
  resolveInstantColumnNames,
  unpackInstant,
  wallField,
} from "../src/drizzle/index.js";
import {
  parseTimestampFields,
  parseTimestampJSON,
  RestTimestampFieldError,
  serializeTimestamp,
} from "../src/rest/index.js";
import {
  instantSchema,
  timestampJSONSchema,
  timestampSchemaDefault,
  wallSchema,
} from "../src/zod/index.js";
import { reviveTimestamp, reviveTimestampFields } from "../src/client/index.js";
import {
  createTimestampFieldValidators,
  submitTimestampFormValue,
  timestampFormValue,
} from "../src/react/index.js";

const instantJson = {
  kind: "instant" as const,
  instant: "2026-08-22T02:30:00Z",
  timezone: "Asia/Jakarta",
};

const wallJson = {
  kind: "wall" as const,
  local: "2026-03-30T09:00:00",
  timezone: "Europe/Paris",
};

describe("@eristack/timestamp/rest", () => {
  it("parses valid instant JSON", () => {
    const ts = parseTimestampJSON(instantJson);
    expect(ts.kind).toBe("instant");
    expect(equalTimestamp(ts, instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta"))).toBe(
      true,
    );
  });

  it("parses valid wall JSON", () => {
    const ts = parseTimestampJSON(wallJson);
    expect(equalTimestamp(ts, wallOf("2026-03-30T09:00:00", "Europe/Paris"))).toBe(
      true,
    );
  });

  it("rejects missing kind", () => {
    expect(() =>
      parseTimestampJSON({ instant: "2026-01-01T00:00:00Z", timezone: "UTC" }),
    ).toThrow(RestTimestampFieldError);
  });

  it("serializes timestamps", () => {
    expect(
      serializeTimestamp(instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta")),
    ).toEqual(instantJson);
  });

  it("parses multiple fields", () => {
    const { postedAt, dueAt } = parseTimestampFields(
      { postedAt: instantJson, dueAt: wallJson },
      ["postedAt", "dueAt"],
    );
    expect(postedAt.kind).toBe("instant");
    expect(dueAt.kind).toBe("wall");
  });
});

describe("@eristack/timestamp/drizzle", () => {
  it("defaults instant column names", () => {
    const names = resolveInstantColumnNames("postedAt");
    expect(names.instantSql).toBe("posted_at_at");
    expect(names.timezoneSql).toBe("posted_at_timezone");
    expect(names.instantProperty).toBe("postedAtAt");
  });

  it("round-trips instant pack/unpack", () => {
    const ts = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
    const row = packInstant("postedAt", ts);
    const restored = unpackInstant("postedAt", row);
    expect(restored && equalTimestamp(restored, ts)).toBe(true);
  });

  it("instantField binding keeps pack/unpack aligned", () => {
    const postedAt = instantField("pgsql", "postedAt");
    const ts = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
    const row = postedAt.pack(ts);
    expect(postedAt.unpack(row)?.kind).toBe("instant");
    expect(postedAt.gridFields.instant).toBe("posted_at_at");
  });

  it("wallField round-trips", () => {
    const dueAt = wallField("pgsql", "dueAt");
    const ts = wallOf("2026-03-30T09:00:00", "Europe/Paris");
    expect(dueAt.unpack(dueAt.pack(ts))?.local).toBe("2026-03-30T09:00:00");
  });
});

describe("@eristack/timestamp/zod", () => {
  it("accepts wire JSON", () => {
    expect(timestampJSONSchema.parse(instantJson)).toEqual(instantJson);
  });

  it("parses to Timestamp", () => {
    const ts = timestampSchemaDefault.parse(instantJson);
    expect(ts.kind).toBe("instant");
  });

  it("instantSchema narrows kind", () => {
    const ts = instantSchema().parse(instantJson);
    expect(ts.kind).toBe("instant");
  });

  it("wallSchema narrows kind", () => {
    const ts = wallSchema().parse(wallJson);
    expect(ts.kind).toBe("wall");
  });
});

describe("@eristack/timestamp/client + react", () => {
  it("revives client JSON", () => {
    const ts = reviveTimestamp(instantJson);
    expect(ts.kind).toBe("instant");
  });

  it("revives selected fields", () => {
    const row = reviveTimestampFields(
      { id: "1", postedAt: instantJson, dueAt: wallJson },
      ["postedAt", "dueAt"],
    );
    expect(row.postedAt.kind).toBe("instant");
    expect(row.dueAt.kind).toBe("wall");
  });

  it("form helpers round-trip JSON", () => {
    const original = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
    const form = timestampFormValue(original);
    const submitted = submitTimestampFormValue(form);
    expect(equalTimestamp(submitted, original)).toBe(true);
  });

  it("validators accept wire JSON", () => {
    const validators = createTimestampFieldValidators({ kind: "instant" });
    expect(validators.onChange({ value: instantJson })).toBeUndefined();
    expect(validators.onChange({ value: wallJson })).toBe(
      "Expected instant timestamp",
    );
  });
});
