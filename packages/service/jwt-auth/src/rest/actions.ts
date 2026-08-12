import type { TokenPair } from "../core/types.js";
import { toErrorResponse } from "./errors.js";
import type {
  AuthSessionBody,
  ChangePasswordActionBody,
  IssueActionBody,
  LoginActionBody,
  RestAuthConfig,
  RestRequest,
  RestResponse,
  TokenPairBody,
} from "./types.js";

function cookieName(config: RestAuthConfig): string {
  return config.refreshCookieName ?? "refresh_token";
}

function transport(config: RestAuthConfig) {
  return config.refreshTokenTransport ?? "body-or-cookie";
}

function readBodyObject(req: RestRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return {};
  }
  return req.body as Record<string, unknown>;
}

function extractRefreshToken(
  req: RestRequest,
  config: RestAuthConfig,
): string | undefined {
  const mode = transport(config);
  const body = readBodyObject(req);
  const fromBody =
    typeof body.refreshToken === "string" ? body.refreshToken : undefined;
  const fromCookie = req.cookies?.get(cookieName(config));

  if (mode === "body") return fromBody;
  if (mode === "cookie") return fromCookie;
  return fromBody ?? fromCookie;
}

function toTokenPairBody(
  pair: TokenPair,
  includeRefreshToken: boolean,
): TokenPairBody {
  return {
    accessToken: pair.accessToken,
    ...(includeRefreshToken ? { refreshToken: pair.refreshToken } : {}),
    accessTokenExpiresAt: pair.accessTokenExpiresAt.toISOString(),
    refreshTokenExpiresAt: pair.refreshTokenExpiresAt.toISOString(),
    tokenType: "Bearer",
    sessionId: pair.sessionId,
  };
}

function extractAccessToken(req: RestRequest): string | undefined {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice("Bearer ".length).trim();
  return token || undefined;
}

function refreshCookieOptions(
  config: RestAuthConfig,
  pair: TokenPair,
) {
  const defaults = config.refreshCookie ?? {};
  return {
    name: cookieName(config),
    value: pair.refreshToken,
    httpOnly: defaults.httpOnly ?? true,
    secure: defaults.secure ?? true,
    sameSite: defaults.sameSite ?? "lax",
    path: defaults.path ?? "/",
    expires: pair.refreshTokenExpiresAt,
  };
}

function shouldSetRefreshCookie(config: RestAuthConfig): boolean {
  const mode = transport(config);
  return mode === "cookie" || mode === "body-or-cookie";
}

function includeRefreshInBody(config: RestAuthConfig): boolean {
  const mode = transport(config);
  return mode === "body" || mode === "body-or-cookie";
}

export function createIssueAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<TokenPairBody | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const body = readBodyObject(req) as Partial<IssueActionBody>;
      if (typeof body.subject !== "string" || !body.subject) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.subject is required",
            },
          },
        };
      }

      const pair = await config.jwtAuth.issueTokens({
        subject: body.subject,
        claims: body.claims,
      });

      const response: RestResponse<TokenPairBody> = {
        status: 201,
        body: toTokenPairBody(pair, includeRefreshInBody(config)),
      };

      if (shouldSetRefreshCookie(config)) {
        response.cookies = [refreshCookieOptions(config, pair)];
      }

      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createLoginAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<TokenPairBody | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const body = readBodyObject(req) as Partial<LoginActionBody>;
      if (typeof body.username !== "string" || typeof body.password !== "string") {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.username and body.password are required",
            },
          },
        };
      }

      const pair = await config.jwtAuth.login({
        username: body.username,
        password: body.password,
        claims: body.claims,
      });

      const response: RestResponse<TokenPairBody> = {
        status: 200,
        body: toTokenPairBody(pair, includeRefreshInBody(config)),
      };

      if (shouldSetRefreshCookie(config)) {
        response.cookies = [refreshCookieOptions(config, pair)];
      }

      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createChangePasswordAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ ok: true } | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const accessToken = extractAccessToken(req);
      if (!accessToken) {
        return {
          status: 401,
          body: {
            error: {
              code: "MISSING_ACCESS_TOKEN",
              message: "Authorization Bearer token required",
            },
          },
        };
      }

      const body = readBodyObject(req) as Partial<ChangePasswordActionBody>;
      if (
        typeof body.currentPassword !== "string" ||
        typeof body.newPassword !== "string"
      ) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.currentPassword and body.newPassword are required",
            },
          },
        };
      }

      const verified = await config.jwtAuth.verifyAccessToken(accessToken);
      await config.jwtAuth.changePassword({
        subject: verified.subject,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });

      return {
        status: 200,
        body: { ok: true },
      };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createRefreshAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<TokenPairBody | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const refreshToken = extractRefreshToken(req, config);
      if (!refreshToken) {
        return {
          status: 400,
          body: {
            error: {
              code: "MISSING_REFRESH_TOKEN",
              message: "Refresh token required",
            },
          },
        };
      }

      const pair = await config.jwtAuth.refresh(refreshToken);
      const response: RestResponse<TokenPairBody> = {
        status: 200,
        body: toTokenPairBody(pair, includeRefreshInBody(config)),
      };

      if (shouldSetRefreshCookie(config)) {
        response.cookies = [refreshCookieOptions(config, pair)];
      }

      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createLogoutAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ ok: true } | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const refreshToken = extractRefreshToken(req, config);
      if (refreshToken) {
        await config.jwtAuth.revoke(refreshToken);
      }

      const response: RestResponse<{ ok: true }> = {
        status: 200,
        body: { ok: true },
      };

      if (shouldSetRefreshCookie(config)) {
        response.clearCookies = [cookieName(config)];
      }

      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createLogoutAllAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ ok: true } | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const accessToken = extractAccessToken(req);
      if (!accessToken) {
        return {
          status: 401,
          body: {
            error: {
              code: "MISSING_ACCESS_TOKEN",
              message: "Authorization Bearer token required",
            },
          },
        };
      }

      const verified = await config.jwtAuth.verifyAccessToken(accessToken);
      await config.jwtAuth.revokeAllForSubject(verified.subject);

      const response: RestResponse<{ ok: true }> = {
        status: 200,
        body: { ok: true },
      };

      if (shouldSetRefreshCookie(config)) {
        response.clearCookies = [cookieName(config)];
      }

      return response;
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createListSessionsAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<
    RestResponse<
      | {
          items: AuthSessionBody[];
          pageInfo: import("@eristack/data-grid").PageInfo;
          query: import("@eristack/data-grid").DataGridQuery;
        }
      | ReturnType<typeof toErrorResponse>["body"]
    >
  > => {
    try {
      const accessToken = extractAccessToken(req);
      if (!accessToken) {
        return {
          status: 401,
          body: {
            error: {
              code: "MISSING_ACCESS_TOKEN",
              message: "Authorization Bearer token required",
            },
          },
        };
      }

      const verified = await config.jwtAuth.verifyAccessToken(accessToken);
      const result = await config.jwtAuth.listSessions(
        verified.subject,
        req.query,
      );

      return {
        status: 200,
        body: {
          items: result.items.map((session) => ({
            id: session.id,
            familyId: session.familyId,
            createdAt: session.createdAt.toISOString(),
            expiresAt: session.expiresAt.toISOString(),
          })),
          pageInfo: result.pageInfo,
          query: result.query,
        },
      };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createRevokeSessionAction(config: RestAuthConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ ok: true } | ReturnType<typeof toErrorResponse>["body"]>> => {
    try {
      const accessToken = extractAccessToken(req);
      if (!accessToken) {
        return {
          status: 401,
          body: {
            error: {
              code: "MISSING_ACCESS_TOKEN",
              message: "Authorization Bearer token required",
            },
          },
        };
      }

      const body = readBodyObject(req);
      const sessionId =
        typeof body.sessionId === "string"
          ? body.sessionId
          : typeof req.params?.sessionId === "string"
            ? req.params.sessionId
            : undefined;

      if (!sessionId) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "sessionId is required",
            },
          },
        };
      }

      const verified = await config.jwtAuth.verifyAccessToken(accessToken);
      await config.jwtAuth.revokeSession({
        sessionId,
        subject: verified.subject,
      });

      return {
        status: 200,
        body: { ok: true },
      };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createRestActions(config: RestAuthConfig) {
  return {
    issue: createIssueAction(config),
    login: createLoginAction(config),
    changePassword: createChangePasswordAction(config),
    refresh: createRefreshAction(config),
    logout: createLogoutAction(config),
    logoutAll: createLogoutAllAction(config),
    listSessions: createListSessionsAction(config),
    revokeSession: createRevokeSessionAction(config),
  };
}
