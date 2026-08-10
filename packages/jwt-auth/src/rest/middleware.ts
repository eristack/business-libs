import { InvalidAccessTokenError } from "../core/errors.js";
import type { JwtAuth } from "../core/types.js";
import type { AuthContext, RestRequest } from "./types.js";

export interface RequireAuthResultOk {
  ok: true;
  auth: AuthContext;
}

export interface RequireAuthResultErr {
  ok: false;
  status: number;
  error: {
    code: string;
    message: string;
  };
}

export type RequireAuthResult = RequireAuthResultOk | RequireAuthResultErr;

export function createRequireAuth(options: { jwtAuth: JwtAuth }) {
  return async (req: RestRequest): Promise<RequireAuthResult> => {
    const authHeader =
      req.headers.get("authorization") ?? req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return {
        ok: false,
        status: 401,
        error: {
          code: "MISSING_ACCESS_TOKEN",
          message: "Authorization Bearer token required",
        },
      };
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return {
        ok: false,
        status: 401,
        error: {
          code: "MISSING_ACCESS_TOKEN",
          message: "Authorization Bearer token required",
        },
      };
    }

    try {
      const verified = await options.jwtAuth.verifyAccessToken(token);
      return {
        ok: true,
        auth: {
          subject: verified.subject,
          claims: verified.claims,
          token: verified.token,
        },
      };
    } catch (error) {
      const message =
        error instanceof InvalidAccessTokenError
          ? error.message
          : "Invalid or expired access token";
      return {
        ok: false,
        status: 401,
        error: {
          code: "INVALID_ACCESS_TOKEN",
          message,
        },
      };
    }
  };
}
