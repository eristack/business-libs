import type { Money } from "@eristack/money";

export const PAYMENT_INTENT_STATUSES = [
  "pending",
  "requires_action",
  "processing",
  "succeeded",
  "failed",
  "canceled",
] as const;

export type PaymentIntentStatus = (typeof PAYMENT_INTENT_STATUSES)[number];

export type MoneyAmountJson = { currency: string; amount: string };

export type PaymentIntent = {
  id: string;
  status: PaymentIntentStatus;
  gateway: string;
  idempotencyKey: string;
  amount: MoneyAmountJson;
  gatewayIntentId?: string;
  clientSecret?: string;
  metadata?: Record<string, string>;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type GatewayEvent = {
  id: string;
  gateway: string;
  eventType: string;
  gatewayEventId?: string;
  payloadJson: string;
  intentId?: string;
  receivedAt: string;
};

export type CreateIntentInput = {
  gateway: string;
  amount: Money | MoneyAmountJson;
  idempotencyKey: string;
  ownerId?: string;
  metadata?: Record<string, string>;
};

export type WebhookInput = {
  gateway: string;
  rawBody: string | Buffer | Record<string, unknown>;
  headers: { get(name: string): string | null };
};

export type ParsedWebhookEvent = {
  eventType: string;
  gatewayEventId?: string;
  gatewayIntentId?: string;
  status?: PaymentIntentStatus;
};

export type PaymentDriverCreateResult = {
  gatewayIntentId: string;
  status: PaymentIntentStatus;
  clientSecret?: string;
};

export type PaymentDriver = {
  gateway: string;
  createIntent(input: {
    amount: MoneyAmountJson;
    idempotencyKey: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentDriverCreateResult>;
  cancelIntent?(input: { gatewayIntentId: string }): Promise<{ status: PaymentIntentStatus }>;
  verifyWebhook(input: {
    rawBody: string | Buffer | Record<string, unknown>;
    headers: { get(name: string): string | null };
  }): boolean | Promise<boolean>;
  parseWebhook(input: {
    rawBody: string | Buffer | Record<string, unknown>;
    headers: { get(name: string): string | null };
  }): ParsedWebhookEvent | Promise<ParsedWebhookEvent>;
};

export type PaymentManagerStore = {
  insertIntent(intent: Omit<PaymentIntent, "createdAt" | "updatedAt"> & Partial<Pick<PaymentIntent, "createdAt" | "updatedAt">>): Promise<PaymentIntent>;
  updateIntent(id: string, patch: Partial<PaymentIntent>): Promise<PaymentIntent>;
  getIntentById(id: string): Promise<PaymentIntent | null>;
  findIntentByGatewayIntentId(
    gateway: string,
    gatewayIntentId: string,
  ): Promise<PaymentIntent | null>;
  findIntentByIdempotencyKey(gateway: string, idempotencyKey: string): Promise<PaymentIntent | null>;
  listIntents(input?: {
    ownerId?: string;
    status?: PaymentIntentStatus;
    limit?: number;
    offset?: number;
  }): Promise<PaymentIntent[]>;
  appendGatewayEvent(event: Omit<GatewayEvent, "receivedAt"> & Partial<Pick<GatewayEvent, "receivedAt">>): Promise<GatewayEvent>;
  listGatewayEvents(intentId: string): Promise<GatewayEvent[]>;
};

export type PaymentManagerConfig = {
  store: PaymentManagerStore;
  drivers: Record<string, PaymentDriver>;
};

export type PaymentManager = {
  createIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  getIntent(id: string): Promise<PaymentIntent>;
  listIntents(input?: Parameters<PaymentManagerStore["listIntents"]>[0]): Promise<PaymentIntent[]>;
  cancelIntent(id: string): Promise<PaymentIntent>;
  handleWebhook(input: WebhookInput): Promise<{ intent?: PaymentIntent; event: GatewayEvent }>;
  listGatewayEvents(intentId: string): Promise<GatewayEvent[]>;
};
