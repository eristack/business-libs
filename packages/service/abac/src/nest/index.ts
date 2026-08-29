import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PolicyDeniedError } from "../core/errors.js";
import type { Abac, AbacContext } from "../core/types.js";

export const ABAC = Symbol("ERISTACK_ABAC");
export const ABAC_POLICY_KEY = "eristack:abac:policy";
export const ABAC_CONTEXT_KEY = "eristack:abac:context";

export const RequirePolicy = (policyId: string) =>
  SetMetadata(ABAC_POLICY_KEY, policyId);

/** Attach a context factory on the handler (or provide globally via module). */
export const AbacContextFactory = (
  factory: (req: unknown) => AbacContext | Promise<AbacContext>,
) => SetMetadata(ABAC_CONTEXT_KEY, factory);

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ABAC) private readonly abac: Abac,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyId = this.reflector.getAllAndOverride<string | undefined>(
      ABAC_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!policyId) return true;

    const factory = this.reflector.getAllAndOverride<
      ((req: unknown) => AbacContext | Promise<AbacContext>) | undefined
    >(ABAC_CONTEXT_KEY, [context.getHandler(), context.getClass()]);

    const req = context.switchToHttp().getRequest();
    if (!factory) {
      throw new ForbiddenException(
        `ABAC policy "${policyId}" requires AbacContextFactory`,
      );
    }
    const ctx = await factory(req);
    try {
      await this.abac.authorize(policyId, ctx);
    } catch (error) {
      if (error instanceof PolicyDeniedError) {
        throw new ConflictException({
          error: {
            code: error.code,
            message: error.message,
            policyId: error.policyId,
            reason: error.reason,
          },
        });
      }
      throw error;
    }
    return true;
  }
}

export class AbacModule {
  static forRoot(options: { abac: Abac }): DynamicModule {
    const providers: Provider[] = [
      { provide: ABAC, useValue: options.abac },
      AbacGuard,
    ];
    return {
      module: AbacModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}
