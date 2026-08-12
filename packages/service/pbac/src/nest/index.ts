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
import type { Pbac, PbacInput } from "../core/types.js";

export const PBAC = Symbol("ERISTACK_PBAC");
export const PBAC_POLICY_KEY = "eristack:pbac:policy";
export const PBAC_INPUT_KEY = "eristack:pbac:input";

export const RequireBusinessPolicy = (policyId: string) =>
  SetMetadata(PBAC_POLICY_KEY, policyId);

export const PbacInputFactory = (
  factory: (req: unknown) => PbacInput | Promise<PbacInput>,
) => SetMetadata(PBAC_INPUT_KEY, factory);

@Injectable()
export class PbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PBAC) private readonly pbac: Pbac,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyId = this.reflector.getAllAndOverride<string | undefined>(
      PBAC_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!policyId) return true;

    const factory = this.reflector.getAllAndOverride<
      ((req: unknown) => PbacInput | Promise<PbacInput>) | undefined
    >(PBAC_INPUT_KEY, [context.getHandler(), context.getClass()]);

    const req = context.switchToHttp().getRequest();
    if (!factory) {
      throw new ConflictException(
        `PBAC policy "${policyId}" requires PbacInputFactory`,
      );
    }
    const input = await factory(req);
    const decision = await this.pbac.check(policyId, input);
    if (!decision.allowed) {
      throw new ConflictException(
        decision.reason ?? `Business policy "${policyId}" denied`,
      );
    }
    return true;
  }
}

export class PbacModule {
  static forRoot(options: { pbac: Pbac }): DynamicModule {
    const providers: Provider[] = [
      { provide: PBAC, useValue: options.pbac },
      PbacGuard,
    ];
    return {
      module: PbacModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}
