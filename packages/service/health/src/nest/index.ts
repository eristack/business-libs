import { Controller, Get, Inject, type DynamicModule } from "@nestjs/common";

import {
  aggregateStatus,
  createHealthRegistry,
  type HealthRegistry,
} from "../core/index.js";

export const HEALTH_REGISTRY = Symbol("ERISTACK_HEALTH_REGISTRY");

export type HealthModuleOptions = {
  registry?: HealthRegistry;
};

@Controller()
export class HealthController {
  constructor(@Inject(HEALTH_REGISTRY) private readonly registry: HealthRegistry) {}

  @Get("health")
  async liveness() {
    return this.registry.runLiveness();
  }

  @Get("ready")
  async readiness() {
    const body = await this.registry.runReadiness();
    return { ...body, httpStatus: aggregateStatus(body) };
  }
}

export class HealthModule {
  static forRoot(options: HealthModuleOptions = {}): DynamicModule {
    const registry = options.registry ?? createHealthRegistry();
    return {
      module: HealthModule,
      controllers: [HealthController],
      providers: [{ provide: HEALTH_REGISTRY, useValue: registry }],
      exports: [HEALTH_REGISTRY],
    };
  }
}
