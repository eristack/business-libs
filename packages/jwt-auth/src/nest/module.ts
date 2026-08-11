import { DynamicModule, Module } from "@nestjs/common";
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

@Module({})
export class JwtAuthModule {
  static register(options: JwtAuthModuleOptions): DynamicModule {
    const restConfig: RestAuthConfig = {
      jwtAuth: options.jwtAuth,
      refreshTokenTransport: options.refreshTokenTransport,
      refreshCookieName: options.refreshCookieName,
      refreshCookie: options.refreshCookie,
    };

    return {
      module: JwtAuthModule,
      controllers: options.controller === false ? [] : [JwtAuthController],
      providers: [
        { provide: JWT_AUTH, useValue: options.jwtAuth },
        { provide: JWT_AUTH_REST_CONFIG, useValue: restConfig },
        JwtAuthGuard,
      ],
      exports: [JWT_AUTH, JWT_AUTH_REST_CONFIG, JwtAuthGuard],
    };
  }
}
