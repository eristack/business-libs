import { normalizePaymentInstrumentDisplay } from "./display.js";
import { normalizeGatewayPaymentMethodRef } from "./gateway-ref.js";
import type { PersistablePaymentInstrument } from "./types.js";

/** Strip to SQL-safe token + display — never includes PAN/CVV. */
export function toPersistable(
  input: PersistablePaymentInstrument,
): PersistablePaymentInstrument {
  return {
    display: normalizePaymentInstrumentDisplay(input.display),
    gateway: normalizeGatewayPaymentMethodRef(input.gateway),
  };
}
