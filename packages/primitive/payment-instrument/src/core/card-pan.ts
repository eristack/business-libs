import { inferCardBrandFromPan } from "./card-brand.js";
import { PaymentInstrumentError } from "./errors.js";
import { isValidLuhn } from "./luhn.js";
import type { CardBrand } from "./types.js";

/** Transient PAN — never JSON-serialize or persist via library helpers. */
export class CardPan {
  readonly #digits: string;

  private constructor(digits: string) {
    this.#digits = digits;
  }

  static parse(raw: string): CardPan {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      throw new PaymentInstrumentError(
        "Card number must be 13–19 digits for validation",
      );
    }
    if (!isValidLuhn(digits)) {
      throw new PaymentInstrumentError("Card number failed Luhn check");
    }
    return new CardPan(digits);
  }

  get last4(): string {
    return this.#digits.slice(-4);
  }

  brandHint(): CardBrand {
    return inferCardBrandFromPan(this.#digits);
  }

  toJSON(): never {
    throw new PaymentInstrumentError(
      "CardPan must not be serialized — use gateway token + PaymentInstrumentDisplay",
    );
  }
}
