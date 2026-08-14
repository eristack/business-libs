import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import type { CredentialStore, RefreshTokenStore } from "../core/types.js";
import { createBackseatCredentialStore } from "./credential-store.js";
import { createBackseatRefreshTokenStore } from "./refresh-token-store.js";

export function createBackseatJwtAuthStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  credentials: CredentialStore;
  refreshTokens: RefreshTokenStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    credentials: createBackseatCredentialStore(backseatStore),
    refreshTokens: createBackseatRefreshTokenStore(backseatStore),
  };
}

export {
  registerJwtAuthBackseat,
  createBackseatCredentialStore,
  createBackseatRefreshTokenStore,
  JWT_AUTH_COLLECTIONS,
} from "./register.js";
export type { RegisterJwtAuthBackseatOptions } from "./register.js";
