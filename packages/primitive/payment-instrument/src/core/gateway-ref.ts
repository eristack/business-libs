import { PaymentInstrumentError } from "./errors.js";
import type { GatewayPaymentMethodRef } from "./types.js";

export function normalizeGatewayPaymentMethodRef(
  input: GatewayPaymentMethodRef,
): GatewayPaymentMethodRef {
  const gateway = input.gateway.trim();
  const tokenId = input.tokenId.trim();
  if (!gateway) {
    throw new PaymentInstrumentError("gateway is required");
  }
  if (!tokenId) {
    throw new PaymentInstrumentError("tokenId is required");
  }
  if (/\d{13,19}/.test(tokenId)) {
    throw new PaymentInstrumentError(
      "tokenId must not look like a raw primary account number",
    );
  }
  const fingerprint = input.fingerprint?.trim();
  return {
    gateway,
    tokenId,
    ...(fingerprint ? { fingerprint } : {}),
  };
}
