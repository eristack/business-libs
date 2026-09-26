import { normalizeBasePath, registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createPaymentManager } from "../core/create-payment-manager.js";
import { createMemoryPaymentDriver } from "../core/memory-driver.js";
import type { PaymentManager, PaymentManagerConfig } from "../core/types.js";
import { createRestPaymentManagerActions } from "../rest/index.js";
import { createBackseatPaymentManagerStore } from "./intent-store.js";
import { createPaymentManagerRestRoutes } from "./routes.js";

export type RegisterPaymentManagerBackseatOptions = {
  basePath?: string;
  paymentManager?: PaymentManager;
  gateway?: string;
} & Partial<Pick<PaymentManagerConfig, "drivers">>;

export function registerPaymentManagerBackseat(
  api: Backseat,
  options: RegisterPaymentManagerBackseatOptions = {},
): PaymentManager {
  const gateway = options.gateway ?? "memory";
  const paymentManager =
    options.paymentManager ??
    createPaymentManager({
      store: createBackseatPaymentManagerStore(api.store),
      drivers: options.drivers ?? {
        [gateway]: createMemoryPaymentDriver(gateway),
      },
    });

  const actions = createRestPaymentManagerActions({ paymentManager });
  const base = normalizeBasePath(options.basePath ?? "/payments");
  registerRestLikeRoutes(api, createPaymentManagerRestRoutes(base, actions));

  return paymentManager;
}

export { PAYMENT_MANAGER_COLLECTIONS } from "./collections.js";
export { createBackseatPaymentManagerStore } from "./intent-store.js";
export { createPaymentManagerRestRoutes } from "./routes.js";
