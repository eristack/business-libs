import { createBackseat } from "../core/create-backseat.js";
import type { Backseat, BackseatStore } from "../core/types.js";

export type BootWorkshopServerOptions = {
  store: BackseatStore;
  baseUrl?: string;
  /** Register routes once — app-owned job/invoice handlers stay in the consumer. */
  registerRoutes: (backseat: Backseat) => void;
  /** Optional async seed after routes (Drizzle reseed, geography fixtures, etc.). */
  seed?: () => Promise<void>;
};

/**
 * Headless Backseat boot for Horizon B Express mirrors — no Vite, no IndexedDB default.
 * Pass `createDrizzleBackseatStore(db)` (or memory store in tests).
 */
export async function bootWorkshopServer(
  options: BootWorkshopServerOptions,
): Promise<Backseat> {
  const backseat = createBackseat({
    store: options.store,
    baseUrl: options.baseUrl ?? "/api",
  });
  options.registerRoutes(backseat);
  if (options.seed) {
    await options.seed();
  }
  return backseat;
}
