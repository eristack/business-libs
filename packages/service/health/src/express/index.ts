import type { RequestHandler } from "express";

import { aggregateStatus, type HealthRegistry } from "../core/index.js";

export function livenessHandler(registry: HealthRegistry): RequestHandler {
  return async (_req, res) => {
    const body = await registry.runLiveness();
    res.status(200).json(body);
  };
}

export function readinessHandler(registry: HealthRegistry): RequestHandler {
  return async (_req, res) => {
    const body = await registry.runReadiness();
    res.status(aggregateStatus(body)).json(body);
  };
}

export type HealthRouterHandlers = {
  liveness: RequestHandler;
  readiness: RequestHandler;
};

export function createHealthRouter(registry: HealthRegistry): HealthRouterHandlers {
  return {
    liveness: livenessHandler(registry),
    readiness: readinessHandler(registry),
  };
}
