import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { JwtAuth } from "../core/types.js";
import { createRequireAuth } from "../rest/index.js";
import { JWT_AUTH } from "./tokens.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly requireAuth: ReturnType<typeof createRequireAuth>;

  constructor(@Inject(JWT_AUTH) jwtAuth: JwtAuth) {
    this.requireAuth = createRequireAuth({ jwtAuth });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      auth?: unknown;
    }>();

    const result = await this.requireAuth({
      headers: {
        get: (name) => {
          const value = req.headers[name.toLowerCase()] ?? req.headers[name];
          if (Array.isArray(value)) return value[0] ?? null;
          return value ?? null;
        },
      },
    });

    if (!result.ok) {
      throw new UnauthorizedException(result.error);
    }

    req.auth = result.auth;
    return true;
  }
}
