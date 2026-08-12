import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { PermissionName, Rbac } from "../core/types.js";

export const RBAC = Symbol("ERISTACK_RBAC");
export const PERMISSION_KEY = "eristack:rbac:permission";

export const RequirePermission = (permission: PermissionName) =>
  SetMetadata(PERMISSION_KEY, permission);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RBAC) private readonly rbac: Rbac,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<
      PermissionName | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!permission) return true;

    const req = context.switchToHttp().getRequest<{
      subject?: string;
      auth?: { subject?: string };
      user?: { id?: string; sub?: string };
    }>();
    const subject =
      req.subject ?? req.auth?.subject ?? req.user?.id ?? req.user?.sub;
    if (!subject) throw new UnauthorizedException("Missing subject");

    const ok = await this.rbac.can(subject, permission);
    if (!ok) {
      throw new ForbiddenException(`Not allowed to "${permission}"`);
    }
    return true;
  }
}

export type RbacModuleOptions = {
  rbac: Rbac;
};

export class RbacModule {
  static forRoot(options: RbacModuleOptions): DynamicModule {
    const providers: Provider[] = [
      { provide: RBAC, useValue: options.rbac },
      RbacGuard,
    ];
    return {
      module: RbacModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}
