export type CheckStatus = "up" | "down";

export type CheckResult = {
  status: CheckStatus;
  message?: string;
  durationMs?: number;
};

export type HealthCheck = () => Promise<CheckResult> | CheckResult;

export type AggregateHealth = {
  status: "ok" | "degraded";
  checks: Record<string, CheckResult>;
};

export type HealthRegistry = {
  registerCheck(name: string, check: HealthCheck): void;
  runLiveness(): Promise<{ status: "ok" }>;
  runReadiness(): Promise<AggregateHealth>;
};
