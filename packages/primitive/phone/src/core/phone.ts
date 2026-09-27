import { PhoneParseError } from "./errors.js";

/** E.164 max 15 digits after + (ITU E.164). */
const E164 = /^\+[1-9]\d{1,14}$/;

export type E164Phone = string & { readonly __brand: unique symbol };

export function normalizeE164(input: string): E164Phone {
  const compact = input.trim().replace(/[\s().-]/g, "");
  if (!compact.startsWith("+")) {
    throw new PhoneParseError('E.164 phone must start with "+"');
  }
  const digits = compact.slice(1);
  if (!/^\d+$/.test(digits)) {
    throw new PhoneParseError("E.164 phone must contain digits only after +");
  }
  const normalized = `+${digits}` as E164Phone;
  if (!E164.test(normalized)) {
    throw new PhoneParseError(`Invalid E.164 length or leading zero: "${input}"`);
  }
  return normalized;
}

export function isValidE164(input: string): boolean {
  try {
    normalizeE164(input);
    return true;
  } catch {
    return false;
  }
}
