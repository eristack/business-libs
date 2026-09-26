import { Money } from "@eristack/money";
import { InvalidPaymentInputError } from "../core/errors.js";
import type { MoneyAmountJson, PaymentDriver, PaymentIntentStatus } from "../core/types.js";

function amountJsonToStripeMinor(amount: MoneyAmountJson): number {
  const money = Money.fromJSON(amount);
  const digits = money.currency.defaultFractionDigits;
  if (digits < 0) {
    throw new InvalidPaymentInputError(
      `Currency ${amount.currency} has no Stripe minor-unit mapping`,
    );
  }
  const str = money.amountString();
  const negative = str.startsWith("-");
  const normalized = negative ? str.slice(1) : str;
  const [whole, frac = ""] = normalized.split(".");
  const minorPart = (frac + "0".repeat(digits)).slice(0, digits);
  const combined = digits === 0 ? whole : `${whole}${minorPart}`;
  const n = Number(combined);
  if (!Number.isSafeInteger(n)) {
    throw new InvalidPaymentInputError("Amount too large for Stripe integer minor units");
  }
  return negative ? -n : n;
}

type StripePaymentIntent = {
  id: string;
  status: string;
  client_secret?: string | null;
};

type StripeClient = {
  paymentIntents: {
    create(params: {
      amount: number;
      currency: string;
      metadata?: Record<string, string>;
    }): Promise<StripePaymentIntent>;
    cancel(id: string): Promise<StripePaymentIntent>;
  };
  webhooks: {
    constructEvent(
      payload: string | Buffer,
      signature: string,
      secret: string,
    ): { id: string; type: string; data: { object: StripePaymentIntent } };
  };
};

const STRIPE_STATUS_MAP: Record<string, PaymentIntentStatus> = {
  requires_payment_method: "pending",
  requires_confirmation: "pending",
  requires_action: "requires_action",
  processing: "processing",
  requires_capture: "processing",
  canceled: "canceled",
  succeeded: "succeeded",
};

function mapStripeStatus(status: string): PaymentIntentStatus {
  return STRIPE_STATUS_MAP[status] ?? "processing";
}

function toStripePayload(rawBody: string | Buffer | Record<string, unknown>): string | Buffer {
  if (typeof rawBody === "string" || Buffer.isBuffer(rawBody)) return rawBody;
  return JSON.stringify(rawBody);
}

/** Pass your Stripe SDK instance — peer dependency `stripe`. */
export function createStripePaymentDriver(options: {
  stripe: StripeClient;
  webhookSecret: string;
}): PaymentDriver {
  return {
    gateway: "stripe",
    async createIntent(input) {
      const pi = await options.stripe.paymentIntents.create({
        amount: amountJsonToStripeMinor(input.amount),
        currency: input.amount.currency.toLowerCase(),
        metadata: input.metadata,
      });
      return {
        gatewayIntentId: pi.id,
        status: mapStripeStatus(pi.status),
        clientSecret: pi.client_secret ?? undefined,
      };
    },
    async cancelIntent(input) {
      const pi = await options.stripe.paymentIntents.cancel(input.gatewayIntentId);
      return { status: mapStripeStatus(pi.status) };
    },
    verifyWebhook({ rawBody, headers }) {
      const signature = headers.get("stripe-signature");
      if (!signature) return false;
      try {
        options.stripe.webhooks.constructEvent(
          toStripePayload(rawBody),
          signature,
          options.webhookSecret,
        );
        return true;
      } catch {
        return false;
      }
    },
    parseWebhook({ rawBody, headers }) {
      const signature = headers.get("stripe-signature");
      if (!signature) {
        throw new Error("Missing stripe-signature header");
      }
      const event = options.stripe.webhooks.constructEvent(
        toStripePayload(rawBody),
        signature,
        options.webhookSecret,
      );
      const object = event.data.object;
      return {
        eventType: event.type,
        gatewayEventId: event.id,
        gatewayIntentId: object.id,
        status: mapStripeStatus(object.status),
      };
    },
  };
}
