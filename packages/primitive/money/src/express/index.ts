import { parseMoneyJSON } from "../rest/index.js";
import { RestMoneyFieldError } from "../rest/errors.js";

export { RestMoneyFieldError };

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
