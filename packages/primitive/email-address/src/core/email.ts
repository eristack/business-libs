import { EmailParseError } from "./errors.js";

export type ParsedEmailAddress = {
  local: string;
  domain: string;
  address: string;
};

const BASIC = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailAddress(input: string): ParsedEmailAddress {
  const trimmed = input.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) {
    throw new EmailParseError(`Invalid email address "${input}"`);
  }
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const address = `${local}@${domain}`.toLowerCase();
  if (!BASIC.test(address)) {
    throw new EmailParseError(`Invalid email address "${input}"`);
  }
  return {
    local: local.toLowerCase(),
    domain: domain.toLowerCase(),
    address,
  };
}

export function normalizeEmail(input: string): string {
  return parseEmailAddress(input).address;
}

export function emailEquals(a: string, b: string): boolean {
  try {
    return normalizeEmail(a) === normalizeEmail(b);
  } catch {
    return false;
  }
}
