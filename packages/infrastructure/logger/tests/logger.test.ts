import { describe, expect, it } from "vitest";
import { createLogger, levelEnabled } from "../src/core/create-logger.js";
import type { LogRecord } from "../src/core/types.js";

describe("createLogger", () => {
  it("writes one JSON line per event", () => {
    const lines: string[] = [];
    const log = createLogger({
      name: "test",
      sink: (line) => lines.push(line),
    });

    log.info("hello", { ok: true });

    expect(lines).toHaveLength(1);
    const record = JSON.parse(lines[0]!) as LogRecord;
    expect(record.level).toBe("info");
    expect(record.message).toBe("hello");
    expect(record.name).toBe("test");
    expect(record.data).toEqual({ ok: true });
    expect(record.timestamp).toBeTruthy();
  });

  it("merges child context", () => {
    const lines: string[] = [];
    const log = createLogger({
      context: { tenantId: "t1" },
      sink: (line) => lines.push(line),
    }).child({ requestId: "r1", userId: "u1" });

    log.warn("scoped");

    const record = JSON.parse(lines[0]!) as LogRecord;
    expect(record.context).toEqual({
      tenantId: "t1",
      requestId: "r1",
      userId: "u1",
    });
  });

  it("respects minimum level", () => {
    const lines: string[] = [];
    const log = createLogger({
      level: "warn",
      sink: (line) => lines.push(line),
    });

    log.debug("skip");
    log.info("skip");
    log.warn("keep");

    expect(lines).toHaveLength(1);
  });

  it("serializes errors on error level", () => {
    const lines: string[] = [];
    const log = createLogger({ sink: (line) => lines.push(line) });
    log.error("failed", new Error("boom"));

    const record = JSON.parse(lines[0]!) as LogRecord;
    expect(record.error?.message).toBe("boom");
  });
});

describe("levelEnabled", () => {
  it("orders levels", () => {
    expect(levelEnabled("error", "info")).toBe(true);
    expect(levelEnabled("info", "warn")).toBe(false);
  });
});
