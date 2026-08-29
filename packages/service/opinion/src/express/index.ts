import type { Router } from "express";
import { createExpressRestRouter } from "@eristack/rest/express";
import type { RestRouter } from "@eristack/rest";

export type MountOpinionRouterOptions = {
  router: RestRouter;
  /** Mount prefix, e.g. `/api/invoices`. */
  basePath?: string;
};

/** Mount an opinion REST router on Express (uses @eristack/rest dispatch). */
export function mountOpinionRouter(options: MountOpinionRouterOptions): Router {
  return createExpressRestRouter({
    router: options.router,
    basePath: options.basePath,
  });
}
