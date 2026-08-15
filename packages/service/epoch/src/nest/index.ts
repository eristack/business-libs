import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Body,
  Query,
  ConflictException,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import type { Epoch, EpochScope, EpochValue } from "../core/types.js";
import { StaleEpochError } from "../core/errors.js";

export const EPOCH = Symbol("ERISTACK_EPOCH");

export type EpochModuleOptions = {
  epoch: Epoch;
};

export class EpochModule {
  static forRoot(options: EpochModuleOptions): DynamicModule {
    const providers: Provider[] = [
      { provide: EPOCH, useValue: options.epoch },
    ];
    return {
      module: EpochModule,
      controllers: [EpochController],
      providers,
      exports: [EPOCH],
      global: true,
    };
  }
}

@Controller("epoch")
export class EpochController {
  constructor(@Inject(EPOCH) private readonly epoch: Epoch) {}

  @Get(":scope")
  async current(@Param("scope") scope: EpochScope) {
    const value = await this.epoch.current(scope);
    return { scope, value };
  }

  @Post(":scope/bump")
  async bump(
    @Param("scope") scope: EpochScope,
    @Body() body: { expected?: EpochValue; by?: number },
  ) {
    try {
      const value = await this.epoch.bump(scope, body);
      return { scope, value };
    } catch (err) {
      if (err instanceof StaleEpochError) {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }

  @Get(":scope/cache-policy")
  async cachePolicy(
    @Param("scope") scope: EpochScope,
    @Query("clientEpoch") clientEpochRaw: string,
  ) {
    const clientEpoch = Number(clientEpochRaw);
    return this.epoch.resolveCachePolicy(scope, clientEpoch);
  }
}
