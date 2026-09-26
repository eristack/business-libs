export class CommsError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "CommsError";
    this.code = code;
  }
}

export class UnknownCommsVendorError extends CommsError {
  constructor(vendor: string) {
    super("UNKNOWN_VENDOR", `Unknown comms vendor: ${vendor}`);
  }
}

export class InvalidCommsInputError extends CommsError {
  constructor(message: string) {
    super("INVALID_INPUT", message);
  }
}

export class CommsIdempotencyConflictError extends CommsError {
  constructor(idempotencyKey: string) {
    super("IDEMPOTENCY_CONFLICT", `Idempotency key reused with different payload: ${idempotencyKey}`);
  }
}

export class CommsMessageNotFoundError extends CommsError {
  constructor(id: string) {
    super("MESSAGE_NOT_FOUND", `Comms message not found: ${id}`);
  }
}

export class CommsChannelNotSupportedError extends CommsError {
  constructor(vendor: string, channel: string) {
    super("CHANNEL_NOT_SUPPORTED", `Vendor ${vendor} does not support channel ${channel}`);
  }
}

export class CommsSendFailedError extends CommsError {
  constructor(message: string) {
    super("SEND_FAILED", message);
  }
}

export class CommsWebhookVerificationError extends CommsError {
  constructor(vendor: string) {
    super("WEBHOOK_VERIFICATION_FAILED", `Webhook verification failed for ${vendor}`);
  }
}
