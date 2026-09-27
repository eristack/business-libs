import express from "express";
import { describe, expect, it } from "vitest";

import { createVercelExpressHandler } from "../src/index.js";

describe("createVercelExpressHandler", () => {
  it("returns a callable handler", () => {
    const app = express();
    app.get("/", (_req, res) => res.send("ok"));
    const handler = createVercelExpressHandler(app);
    expect(typeof handler).toBe("function");
  });
});
