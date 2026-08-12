import { Router } from "express";
import {
  createRestActions,
  type RestAuthConfig,
} from "../rest/index.js";
import { applyRestResponse, toRestRequest } from "./map.js";

export interface ExpressJwtAuthRouterOptions extends RestAuthConfig {
  /** Mount paths relative to the router. */
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
}

export function createJwtAuthRouter(options: ExpressJwtAuthRouterOptions): Router {
  const actions = createRestActions(options);
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

  const router = Router();

  router.post(paths.issue, async (req, res) => {
    applyRestResponse(res, await actions.issue(toRestRequest(req)));
  });

  router.post(paths.login, async (req, res) => {
    applyRestResponse(res, await actions.login(toRestRequest(req)));
  });

  router.post(paths.changePassword, async (req, res) => {
    applyRestResponse(res, await actions.changePassword(toRestRequest(req)));
  });

  router.post(paths.refresh, async (req, res) => {
    applyRestResponse(res, await actions.refresh(toRestRequest(req)));
  });

  router.post(paths.logout, async (req, res) => {
    applyRestResponse(res, await actions.logout(toRestRequest(req)));
  });

  router.post(paths.logoutAll, async (req, res) => {
    applyRestResponse(res, await actions.logoutAll(toRestRequest(req)));
  });

  router.get(paths.sessions, async (req, res) => {
    applyRestResponse(res, await actions.listSessions(toRestRequest(req)));
  });

  router.delete(paths.revokeSession, async (req, res) => {
    applyRestResponse(
      res,
      await actions.revokeSession(
        toRestRequest(req, {
          sessionId:
            typeof req.params.sessionId === "string" ? req.params.sessionId : undefined,
        }),
      ),
    );
  });

  return router;
}
