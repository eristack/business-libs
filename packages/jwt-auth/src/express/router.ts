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
    refresh?: string;
    logout?: string;
    logoutAll?: string;
  };
}

export function createJwtAuthRouter(options: ExpressJwtAuthRouterOptions): Router {
  const actions = createRestActions(options);
  const paths = {
    issue: options.paths?.issue ?? "/issue",
    refresh: options.paths?.refresh ?? "/refresh",
    logout: options.paths?.logout ?? "/logout",
    logoutAll: options.paths?.logoutAll ?? "/logout-all",
  };

  const router = Router();

  router.post(paths.issue, async (req, res) => {
    applyRestResponse(res, await actions.issue(toRestRequest(req)));
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

  return router;
}
