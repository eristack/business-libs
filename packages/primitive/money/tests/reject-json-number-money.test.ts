import { describe, expect, it } from "vitest";
import {
  findJsonNumberMoneyFields,
  rejectJsonNumberMoneyBody,
} from "../src/express/index.js";

describe("rejectJsonNumberMoneyBody", () => {
  it("finds nested money fields with number amounts", () => {
    const body = {
      line: { price: { currency: "USD", amount: 19.99 } },
      ok: { currency: "USD", amount: "10.00" },
    };
    expect(findJsonNumberMoneyFields(body)).toEqual(["body.line.price"]);
  });

  it("middleware responds 400 when body has number amounts", () => {
    const middleware = rejectJsonNumberMoneyBody();
    const req = { body: { total: { currency: "USD", amount: 1 } } };
    const res = {
      statusCode: 0,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
      },
    };
    let nextCalled = false;
    middleware(req as never, res as never, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });

  it("passes through string amounts", () => {
    const middleware = rejectJsonNumberMoneyBody();
    const req = { body: { total: { currency: "USD", amount: "1.00" } } };
    let nextCalled = false;
    middleware(req as never, {} as never, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
