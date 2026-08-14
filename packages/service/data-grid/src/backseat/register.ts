import { registerRestLikeRoutes, toRestLikeRequest } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import {
  createDataGridListAction,
  type RestRequest,
} from "../rest/index.js";
import type { DataGridQuery, DataGridResult, DataGridSchema } from "../core/types.js";

function toDataGridRestRequest(
  req: ReturnType<typeof toRestLikeRequest>,
): RestRequest {
  return {
    ...req,
    headers: {
      get: (name) => req.headers.get(name) ?? null,
    },
  };
}

export type RegisterDataGridBackseatRouteOptions<T> = {
  path: string;
  name?: string;
  schema: DataGridSchema;
  load: (query: DataGridQuery, req: RestRequest) => Promise<DataGridResult<T>>;
};

/** Register a data-grid list route on Backseat (parse query → load → grid body). */
export function registerDataGridBackseatRoute<T>(
  api: Backseat,
  options: RegisterDataGridBackseatRouteOptions<T>,
): void {
  const action = createDataGridListAction({
    schema: options.schema,
    load: options.load,
  });

  registerRestLikeRoutes(api, [
    {
      method: "GET",
      path: options.path,
      name: options.name ?? "data-grid.list",
      handler: (req) => action(toDataGridRestRequest(req)),
    },
  ]);
}

export type RegisterDataGridBackseatOptions = {
  routes?: RegisterDataGridBackseatRouteOptions<unknown>[];
};

/** Register one or more data-grid list routes. */
export function registerDataGridBackseat(
  api: Backseat,
  options: RegisterDataGridBackseatOptions,
): void {
  for (const route of options.routes ?? []) {
    registerDataGridBackseatRoute(api, route);
  }
}
