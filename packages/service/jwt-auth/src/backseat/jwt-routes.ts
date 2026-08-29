import { joinRoutePath } from "@eristack/backseat/adapters";
import { createRestActions } from "../rest/index.js";

type JwtAuthActions = ReturnType<typeof createRestActions>;

export function createJwtAuthRestRoutes(
  base: string,
  paths: {
    issue: string;
    login: string;
    changePassword: string;
    refresh: string;
    logout: string;
    logoutAll: string;
    sessions: string;
    revokeSession: string;
  },
  actions: JwtAuthActions,
) {
  return [
    { method: "POST" as const, path: joinRoutePath(base, paths.issue), name: "jwt-auth.issue", handler: (req: Parameters<JwtAuthActions["issue"]>[0]) => actions.issue(req) },
    { method: "POST" as const, path: joinRoutePath(base, paths.login), name: "jwt-auth.login", handler: (req: Parameters<JwtAuthActions["login"]>[0]) => actions.login(req) },
    { method: "POST" as const, path: joinRoutePath(base, paths.changePassword), name: "jwt-auth.change-password", handler: (req: Parameters<JwtAuthActions["changePassword"]>[0]) => actions.changePassword(req) },
    { method: "POST" as const, path: joinRoutePath(base, paths.refresh), name: "jwt-auth.refresh", handler: (req: Parameters<JwtAuthActions["refresh"]>[0]) => actions.refresh(req) },
    { method: "POST" as const, path: joinRoutePath(base, paths.logout), name: "jwt-auth.logout", handler: (req: Parameters<JwtAuthActions["logout"]>[0]) => actions.logout(req) },
    { method: "POST" as const, path: joinRoutePath(base, paths.logoutAll), name: "jwt-auth.logout-all", handler: (req: Parameters<JwtAuthActions["logoutAll"]>[0]) => actions.logoutAll(req) },
    { method: "GET" as const, path: joinRoutePath(base, paths.sessions), name: "jwt-auth.sessions", handler: (req: Parameters<JwtAuthActions["listSessions"]>[0]) => actions.listSessions(req) },
    { method: "DELETE" as const, path: joinRoutePath(base, paths.revokeSession), name: "jwt-auth.revoke-session", handler: (req: Parameters<JwtAuthActions["revokeSession"]>[0]) => actions.revokeSession(req) },
  ];
}
