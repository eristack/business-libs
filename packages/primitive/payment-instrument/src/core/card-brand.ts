import type { CardBrand } from "./types.js";

/** BIN prefix hint — not authoritative; prefer gateway-reported brand when available. */
export function inferCardBrandFromPan(digits: string): CardBrand {
  if (digits.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (digits.startsWith("6011") || digits.startsWith("65")) return "discover";
  if (digits.startsWith("35")) return "jcb";
  if (digits.startsWith("62")) return "unionpay";
  if (digits.startsWith("36") || digits.startsWith("38")) return "diners";
  return "unknown";
}

export function normalizeCardBrand(value: string): CardBrand {
  const lower = value.trim().toLowerCase();
  if (lower === "american express" || lower === "americanexpress") return "amex";
  if (lower === "master card") return "mastercard";
  const allowed: CardBrand[] = [
    "visa",
    "mastercard",
    "amex",
    "discover",
    "jcb",
    "unionpay",
    "diners",
    "unknown",
  ];
  if ((allowed as string[]).includes(lower)) {
    return lower as CardBrand;
  }
  return "unknown";
}
