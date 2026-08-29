import { registerMountedRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createStockMovement,
  type StockMovement,
  type StockMovementInput,
} from "../core/create-stock-movement.js";
import { createStockMovementRoutes } from "./stock-routes.js";

export type RegisterStockMovementBackseatOptions = {
  basePath?: string;
  movement?: StockMovement;
};

export function registerStockMovementBackseat(
  api: Backseat,
  options: RegisterStockMovementBackseatOptions = {},
): StockMovement {
  const movement =
    options.movement ??
    createStockMovement({
      store: createBackseatLedgerStore({ store: api.store }),
    });

  registerMountedRoutes(
    api,
    options.basePath ?? "/stock-movements",
    createStockMovementRoutes(movement),
  );

  api.registerAction("stockMovement.append", async ({ input }) =>
    movement.append(input as StockMovementInput),
  );

  return movement;
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
