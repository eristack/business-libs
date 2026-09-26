import type { PaymentManager } from "../core/types.js";

export type RestRequest = {
  method: string;
  headers: { get(name: string): string | null };
  body: unknown;
  params: Record<string, string | undefined>;
  query: Record<string, string | string[] | undefined>;
};

export type RestResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

export type RestPaymentManagerConfig = {
  paymentManager: PaymentManager;
};

export type PaymentIntentBody = {
  id: string;
  status: string;
  gateway: string;
  idempotencyKey: string;
  amount: { currency: string; amount: string };
  gatewayIntentId?: string;
  clientSecret?: string;
  metadata?: Record<string, string>;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntentBody = {
  gateway: string;
  amount: { currency: string; amount: string };
  idempotencyKey: string;
  ownerId?: string;
  metadata?: Record<string, string>;
};
