export const CARD_FUNDINGS = ["credit", "debit", "prepaid", "unknown"] as const;
export type CardFunding = (typeof CARD_FUNDINGS)[number];

export const CARD_BRANDS = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "jcb",
  "unionpay",
  "diners",
  "unknown",
] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

/** Safe to store after tokenization — no PAN, no CVV. */
export type PaymentInstrumentDisplay = {
  last4: string;
  brand: CardBrand;
  funding: CardFunding;
  expMonth: number;
  expYear: number;
};

/** PSP token handle — store in Postgres, not card digits. */
export type GatewayPaymentMethodRef = {
  gateway: string;
  tokenId: string;
  fingerprint?: string;
};

export type PersistablePaymentInstrument = {
  display: PaymentInstrumentDisplay;
  gateway: GatewayPaymentMethodRef;
};
