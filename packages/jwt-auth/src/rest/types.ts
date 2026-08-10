import type { JwtAuth, JwtClaims, TokenPair, VerifiedAccessToken } from "../core/types.js";

export interface RestHeaders {
  get(name: string): string | null | undefined;
}

export interface RestCookies {
  get(name: string): string | undefined;
}

export interface RestRequest {
  method?: string;
  headers: RestHeaders;
  cookies?: RestCookies;
  body?: unknown;
}

export interface SetCookieOptions {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAgeSeconds?: number;
  expires?: Date;
}

export interface RestResponse<T = unknown> {
  status: number;
  body: T;
  headers?: Record<string, string>;
  cookies?: SetCookieOptions[];
  clearCookies?: string[];
}

export type RefreshTokenTransport = "body" | "cookie" | "body-or-cookie";

export interface RestAuthConfig {
  jwtAuth: JwtAuth;
  refreshTokenTransport?: RefreshTokenTransport;
  refreshCookieName?: string;
  refreshCookie?: Omit<SetCookieOptions, "name" | "value" | "expires" | "maxAgeSeconds">;
}

export interface IssueActionBody {
  subject: string;
  claims?: JwtClaims;
}

export interface TokenPairBody {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
}

export interface AuthContext {
  subject: string;
  claims: VerifiedAccessToken["claims"];
  token: string;
}

export interface RestErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type TokenPairResult = TokenPair;
