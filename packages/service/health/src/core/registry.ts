import type { AggregateHealth, HealthCheck, HealthRegistry } from "./types.js";

export function createHealthRegistry(): HealthRegistry {
  const checks = new Map<string, HealthCheck>();

  return {
    registerCheck(name, check) {
      checks.set(name, check);
    },
    async runLiveness() {
      return { status: "ok" };
    },
    async runReadiness(): Promise<AggregateHealth> {
      const results: AggregateHealth["checks"] = {};
      let degraded = false;
      for (const [name, check] of checks) {
        const started = Date.now();
        const raw = await Promise.resolve(check());
        results[name] = {
          ...raw,
          durationMs: Date.now() - started,
        };
        if (raw.status === "down") degraded = true;
      }
      return { status: degraded ? "degraded" : "ok", checks: results };
    },
  };
}

export function aggregateStatus(body: AggregateHealth): number {
  return body.status === "ok" ? 200 : 503;
}
