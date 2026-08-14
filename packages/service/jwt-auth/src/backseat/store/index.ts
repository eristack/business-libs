import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import type { CredentialStore, RefreshTokenStore } from "../../core/types.js";
import { createBackseatCredentialStore } from "../credential-store.js";
import { createBackseatRefreshTokenStore } from "../refresh-token-store.js";

export type CreateIndexedDbJwtAuthStoresOptions = {
  dbName?: string;
};

/** Browser default — IndexedDB-backed jwt-auth stores via Backseat. */
export function createIndexedDbJwtAuthStores(
  options: CreateIndexedDbJwtAuthStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  credentials: CredentialStore;
  refreshTokens: RefreshTokenStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    credentials: createBackseatCredentialStore(backseatStore),
    refreshTokens: createBackseatRefreshTokenStore(backseatStore),
  };
}

export {
  createBackseatCredentialStore,
  createBackseatRefreshTokenStore,
  JWT_AUTH_COLLECTIONS,
} from "../register.js";
