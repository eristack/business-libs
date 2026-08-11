import {
  DynamicModule,
  Module,
  type InjectionToken,
  type ModuleMetadata,
  type OptionalFactoryDependency,
} from "@nestjs/common";
import type { JwtAuth } from "../core/types.js";
import type { RestAuthConfig } from "../rest/index.js";
import { JwtAuthController } from "./controller.js";
import { JwtAuthGuard } from "./guard.js";
import { JWT_AUTH, JWT_AUTH_REST_CONFIG } from "./tokens.js";

export interface JwtAuthModuleOptions extends RestAuthConfig {
  jwtAuth: JwtAuth;
  /** When false, do not register the auth controller routes. Default true. */
  controller?: boolean;
}

export interface JwtAuthModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  /**
   * App factory that builds options from injected deps (DB, ConfigService, …).
   * The package never constructs those dependencies.
   */
  // Nest factory args are typed by `inject`; keep this open like other Nest async modules.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (
    ...args: any[]
  ) =>
    | Omit<JwtAuthModuleOptions, "controller">
    | Promise<Omit<JwtAuthModuleOptions, "controller">>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  /** When false, do not register the auth controller routes. Default true. */
  controller?: boolean;
}

const MODULE_OPTIONS = "JWT_AUTH_MODULE_OPTIONS";

function restConfigFrom(options: RestAuthConfig): RestAuthConfig {
  return {
    jwtAuth: options.jwtAuth,
    refreshTokenTransport: options.refreshTokenTransport,
    refreshCookieName: options.refreshCookieName,
    refreshCookie: options.refreshCookie,
  };
}

@Module({})
export class JwtAuthModule {
  /** Synchronous register when the app already constructed `jwtAuth`. */
  static register(options: JwtAuthModuleOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      controllers: options.controller === false ? [] : [JwtAuthController],
      providers: [
        { provide: JWT_AUTH, useValue: options.jwtAuth },
        { provide: JWT_AUTH_REST_CONFIG, useValue: restConfigFrom(options) },
        JwtAuthGuard,
      ],
      exports: [JWT_AUTH, JWT_AUTH_REST_CONFIG, JwtAuthGuard],
    };
  }

  /**
   * Inject app-owned dependencies and build `jwtAuth` in `useFactory`.
   *
   * @example
   * ```ts
   * JwtAuthModule.registerAsync({
   *   imports: [DatabaseModule],
   *   inject: [DRIZZLE],
   *   useFactory: (db) => ({
   *     jwtAuth: createJwtAuth({
   *       accessSecret: process.env.JWT_ACCESS_SECRET!,
   *       store: createDrizzleRefreshTokenStore({ dialect: "pgsql", db, table }),
   *     }),
   *     refreshTokenTransport: "body",
   *   }),
   * })
   * ```
   */
  static registerAsync(options: JwtAuthModuleAsyncOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: options.imports ?? [],
      controllers: options.controller === false ? [] : [JwtAuthController],
      providers: [
        {
          provide: MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        {
          provide: JWT_AUTH,
          useFactory: (opts: RestAuthConfig) => opts.jwtAuth,
          inject: [MODULE_OPTIONS],
        },
        {
          provide: JWT_AUTH_REST_CONFIG,
          useFactory: (opts: RestAuthConfig) => restConfigFrom(opts),
          inject: [MODULE_OPTIONS],
        },
        JwtAuthGuard,
      ],
      exports: [JWT_AUTH, JWT_AUTH_REST_CONFIG, JwtAuthGuard],
    };
  }
}
