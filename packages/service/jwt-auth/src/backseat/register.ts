import {
  normalizeBasePath,
  registerRestLikeRoutes,
} from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRestActions, type RestAuthConfig } from "../rest/index.js";
import { createJwtAuthRestRoutes } from "./jwt-routes.js";

export type RegisterJwtAuthBackseatOptions = RestAuthConfig & {
  basePath?: string;
  paths?: {
    issue?: string;
    login?: string;
    changePassword?: string;
    refresh?: string;
    logout?: string;
    logoutAll?: string;
    sessions?: string;
    revokeSession?: string;
  };
};

/** Register jwt-auth REST routes on a Backseat engine. */
export function registerJwtAuthBackseat(
  api: Backseat,
  options: RegisterJwtAuthBackseatOptions,
): void {
  const actions = createRestActions(options);
  const base = normalizeBasePath(options.basePath ?? "/auth");
  const paths = {
    issue: options.paths?.issue ?? "/issue",
    login: options.paths?.login ?? "/login",
    changePassword: options.paths?.changePassword ?? "/change-password",
    refresh: options.paths?.refresh ?? "/refresh",
    logout: options.paths?.logout ?? "/logout",
    logoutAll: options.paths?.logoutAll ?? "/logout-all",
    sessions: options.paths?.sessions ?? "/sessions",
    revokeSession: options.paths?.revokeSession ?? "/sessions/:sessionId",
  };

  registerRestLikeRoutes(api, createJwtAuthRestRoutes(base, paths, actions));
}

export { createBackseatCredentialStore } from "./credential-store.js";
export { createBackseatRefreshTokenStore } from "./refresh-token-store.js";
export { JWT_AUTH_COLLECTIONS } from "./collections.js";
