import { normalizeCardBrand } from "./card-brand.js";
import { PaymentInstrumentError } from "./errors.js";
import type { CardFunding, PaymentInstrumentDisplay } from "./types.js";
import { CARD_FUNDINGS } from "./types.js";

export function normalizeCardFunding(value: string): CardFunding {
  const lower = value.trim().toLowerCase();
  if ((CARD_FUNDINGS as readonly string[]).includes(lower)) {
    return lower as CardFunding;
  }
  return "unknown";
}

export function normalizePaymentInstrumentDisplay(
  input: PaymentInstrumentDisplay,
): PaymentInstrumentDisplay {
  const last4 = input.last4.replace(/\D/g, "");
  if (last4.length !== 4) {
    throw new PaymentInstrumentError("last4 must be exactly four digits");
  }
  const expMonth = input.expMonth;
  const expYear = input.expYear;
  if (!Number.isInteger(expMonth) || expMonth < 1 || expMonth > 12) {
    throw new PaymentInstrumentError("expMonth must be 1–12");
  }
  if (!Number.isInteger(expYear) || expYear < 2000 || expYear > 2100) {
    throw new PaymentInstrumentError("expYear out of supported range");
  }
  return {
    last4,
    brand: normalizeCardBrand(String(input.brand)),
    funding: normalizeCardFunding(String(input.funding)),
    expMonth,
    expYear,
  };
}
