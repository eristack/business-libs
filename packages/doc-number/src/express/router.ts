import { Router } from "express";
import { createRestActions, type RestDocNumberConfig } from "../rest/index.js";
import { applyRestResponse, toRestRequest } from "./map.js";

export interface ExpressDocNumberRouterOptions extends RestDocNumberConfig {
  /** Mount paths relative to the router. */
  paths?: {
    formats?: string;
    activeFormat?: string;
    formatById?: string;
    preview?: string;
  };
}

/**
 * Headless Express router for document-number format configuration.
 * Mount behind your own auth middleware.
 *
 * @example
 * ```ts
 * app.use("/doc-number", requireAdmin, createDocNumberRouter({ docNumber }));
 * ```
 */
export function createDocNumberRouter(
  options: ExpressDocNumberRouterOptions,
): Router {
  const actions = createRestActions(options);
  const paths = {
    formats: options.paths?.formats ?? "/formats",
    activeFormat: options.paths?.activeFormat ?? "/formats/active",
    formatById: options.paths?.formatById ?? "/formats/:id",
    preview: options.paths?.preview ?? "/preview",
  };

  const router = Router();

  router.get(paths.formats, async (req, res) => {
    applyRestResponse(res, await actions.listFormats(toRestRequest(req)));
  });

  router.get(paths.activeFormat, async (req, res) => {
    applyRestResponse(res, await actions.getActiveFormat(toRestRequest(req)));
  });

  router.get(paths.formatById, async (req, res) => {
    applyRestResponse(
      res,
      await actions.getFormatById(
        toRestRequest(req, {
          id: typeof req.params.id === "string" ? req.params.id : undefined,
        }),
      ),
    );
  });

  router.post(paths.formats, async (req, res) => {
    applyRestResponse(res, await actions.createFormat(toRestRequest(req)));
  });

  router.patch(paths.formatById, async (req, res) => {
    applyRestResponse(
      res,
      await actions.updateFormat(
        toRestRequest(req, {
          id: typeof req.params.id === "string" ? req.params.id : undefined,
        }),
      ),
    );
  });

  router.post(paths.preview, async (req, res) => {
    applyRestResponse(res, await actions.preview(toRestRequest(req)));
  });

  return router;
}
