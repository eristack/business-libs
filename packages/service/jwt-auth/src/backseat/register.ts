import { registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRestActions, type RestAuthConfig } from "../rest/index.js";

export type RegisterJwtAuthBackseatOptions = RestAuthConfig & {
  /** Route prefix relative to Backseat baseUrl. Default `/auth`. */
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

function joinPath(base: string, segment: string): string {
  const left = base.replace(/\/$/, "");
  const right = segment.startsWith("/") ? segment : `/${segment}`;
  return `${left}${right}` || "/";
}

/** Register jwt-auth REST routes on a Backseat engine. */
export function registerJwtAuthBackseat(
  api: Backseat,
  options: RegisterJwtAuthBackseatOptions,
): void {
  const actions = createRestActions(options);
  const base = options.basePath ?? "/auth";
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

  registerRestLikeRoutes(api, [
    {
      method: "POST",
      path: joinPath(base, paths.issue),
      name: "jwt-auth.issue",
      handler: (req) => actions.issue(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.login),
      name: "jwt-auth.login",
      handler: (req) => actions.login(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.changePassword),
      name: "jwt-auth.change-password",
      handler: (req) => actions.changePassword(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.refresh),
      name: "jwt-auth.refresh",
      handler: (req) => actions.refresh(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.logout),
      name: "jwt-auth.logout",
      handler: (req) => actions.logout(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.logoutAll),
      name: "jwt-auth.logout-all",
      handler: (req) => actions.logoutAll(req),
    },
    {
      method: "GET",
      path: joinPath(base, paths.sessions),
      name: "jwt-auth.sessions",
      handler: (req) => actions.listSessions(req),
    },
    {
      method: "DELETE",
      path: joinPath(base, paths.revokeSession),
      name: "jwt-auth.revoke-session",
      handler: (req) => actions.revokeSession(req),
    },
  ]);
}

export { createBackseatCredentialStore } from "./credential-store.js";
export { createBackseatRefreshTokenStore } from "./refresh-token-store.js";
export { JWT_AUTH_COLLECTIONS } from "./collections.js";
