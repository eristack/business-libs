import type { NextFunction, Request, Response } from "express";
import { parseMoneyJSON } from "../rest/index.js";
import { RestMoneyFieldError } from "../rest/errors.js";
import {
  findJsonNumberMoneyFields,
} from "./reject-json-number-money.js";

export { RestMoneyFieldError };
export { findJsonNumberMoneyFields };

export function readMoney(value: unknown, path = "money") {
  return parseMoneyJSON(value, path);
}

export function readMoneyField(
  body: unknown,
  field: string,
): ReturnType<typeof parseMoneyJSON> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new RestMoneyFieldError(field, "body must be an object");
  }
  return parseMoneyJSON((body as Record<string, unknown>)[field], field);
}

export function sendMoney(amount: { toJSON(): { currency: string; amount: string } }) {
  return amount.toJSON();
}

/**
 * Express middleware — reject request bodies with MoneyJSON `amount` as JSON numbers.
 * Wire amounts must be decimal strings (same rule as `@eristack/money/rest`).
 */
export function rejectJsonNumberMoneyBody(options?: { status?: number }) {
  const status = options?.status ?? 400;
  return (req: Request, res: Response, next: NextFunction) => {
    const hits = findJsonNumberMoneyFields(req.body);
    if (hits.length === 0) {
      next();
      return;
    }
    res.status(status).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `Money amounts must be decimal strings, not JSON numbers (${hits.join(", ")})`,
      },
    });
  };
}
