export class PaymentManagerError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PaymentManagerError";
    this.code = code;
  }
}

export class PaymentIntentNotFoundError extends PaymentManagerError {
  constructor(id: string) {
    super("PAYMENT_INTENT_NOT_FOUND", `Payment intent not found: ${id}`);
    this.name = "PaymentIntentNotFoundError";
  }
}

export class UnknownGatewayError extends PaymentManagerError {
  constructor(gateway: string) {
    super("UNKNOWN_GATEWAY", `No payment driver registered for gateway: ${gateway}`);
    this.name = "UnknownGatewayError";
  }
}

export class InvalidPaymentInputError extends PaymentManagerError {
  constructor(message: string) {
    super("INVALID_PAYMENT_INPUT", message);
    this.name = "InvalidPaymentInputError";
  }
}

export class WebhookVerificationError extends PaymentManagerError {
  constructor(gateway: string) {
    super("WEBHOOK_VERIFICATION_FAILED", `Webhook verification failed for gateway: ${gateway}`);
    this.name = "WebhookVerificationError";
  }
}

export class PaymentIntentNotCancelableError extends PaymentManagerError {
  constructor(id: string, status: string) {
    super(
      "PAYMENT_INTENT_NOT_CANCELABLE",
      `Payment intent ${id} cannot be canceled (status: ${status})`,
    );
    this.name = "PaymentIntentNotCancelableError";
  }
}

export class IdempotencyConflictError extends PaymentManagerError {
  constructor(idempotencyKey: string) {
    super(
      "IDEMPOTENCY_CONFLICT",
      `Idempotency key ${idempotencyKey} was reused with a different amount or gateway`,
    );
    this.name = "IdempotencyConflictError";
  }
}
