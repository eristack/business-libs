import * as jose from "jose";
import { generateId, generateOpaqueToken, hashToken } from "./crypto.js";
import { addMs, durationToMs } from "./duration.js";
import {
  ConfigurationError,
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
} from "./errors.js";
import type {
  AccessTokenClaims,
  Clock,
  IssueTokensInput,
  JwtAuth,
  JwtAuthConfig,
  JwtClaims,
  TokenPair,
  VerifiedAccessToken,
} from "./types.js";

const systemClock: Clock = {
  now: () => new Date(),
};

function toSecretKey(secret: string | Uint8Array): Uint8Array {
  if (typeof secret === "string") {
    return new TextEncoder().encode(secret);
  }
  return secret;
}

export function createJwtAuth(config: JwtAuthConfig): JwtAuth {
  if (!config.accessSecret || (typeof config.accessSecret === "string" && config.accessSecret.length < 16)) {
    throw new ConfigurationError("accessSecret must be at least 16 characters");
  }
  if (!config.store) {
    throw new ConfigurationError("store is required");
  }

  const accessTtlMs = durationToMs(config.accessTokenTtl ?? "15m");
  const refreshTtlMs = durationToMs(config.refreshTokenTtl ?? "30d");
  const clock = config.clock ?? systemClock;
  const key = toSecretKey(config.accessSecret);

  async function signAccessToken(
    subject: string,
    claims: JwtClaims | undefined,
    now: Date,
  ): Promise<{ token: string; expiresAt: Date }> {
    const expiresAt = addMs(now, accessTtlMs);
    const payload: jose.JWTPayload = {
      ...(config.defaultClaims ?? {}),
      ...(claims ?? {}),
      sub: subject,
    };

    let builder = new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(subject)
      .setIssuedAt(Math.floor(now.getTime() / 1000))
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .setJti(generateId());

    if (config.issuer) builder = builder.setIssuer(config.issuer);
    if (config.audience) builder = builder.setAudience(config.audience);

    const token = await builder.sign(key);
    return { token, expiresAt };
  }

  async function issueTokensInternal(
    input: IssueTokensInput,
  ): Promise<TokenPair & { refreshTokenId: string; familyId: string }> {
    if (!input.subject) {
      throw new ConfigurationError("subject is required");
    }

    const now = clock.now();
    const familyId = input.familyId ?? generateId();
    const refreshToken = generateOpaqueToken();
    const refreshId = generateId();
    const refreshExpiresAt = addMs(now, refreshTtlMs);

    const access = await signAccessToken(input.subject, input.claims, now);

    await config.store.save({
      id: refreshId,
      subject: input.subject,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt: refreshExpiresAt,
      revokedAt: null,
      createdAt: now,
      replacedByTokenId: null,
      claims: input.claims,
    });

    return {
      accessToken: access.token,
      refreshToken,
      accessTokenExpiresAt: access.expiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
      tokenType: "Bearer",
      refreshTokenId: refreshId,
      familyId,
    };
  }

  async function issueTokens(input: IssueTokensInput): Promise<TokenPair> {
    const { refreshTokenId: _id, familyId: _family, ...pair } =
      await issueTokensInternal(input);
    return pair;
  }

  async function verifyAccessToken(accessToken: string): Promise<VerifiedAccessToken> {
    try {
      const { payload } = await jose.jwtVerify(accessToken, key, {
        algorithms: ["HS256"],
        issuer: config.issuer,
        audience: config.audience,
      });

      if (typeof payload.sub !== "string" || !payload.sub) {
        throw new InvalidAccessTokenError("Access token missing subject");
      }

      const claims = payload as AccessTokenClaims;
      return {
        subject: payload.sub,
        claims,
        token: accessToken,
      };
    } catch (error) {
      if (error instanceof InvalidAccessTokenError) throw error;
      throw new InvalidAccessTokenError(
        error instanceof Error ? error.message : "Invalid or expired access token",
      );
    }
  }

  async function refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    const now = clock.now();
    const tokenHash = hashToken(refreshToken);
    const existing = await config.store.findByHash(tokenHash);

    if (!existing) {
      throw new InvalidRefreshTokenError();
    }

    if (existing.expiresAt.getTime() <= now.getTime()) {
      throw new InvalidRefreshTokenError("Refresh token expired");
    }

    if (existing.revokedAt) {
      await config.store.revokeFamily(existing.familyId, now);
      throw new RefreshTokenReuseError();
    }

    const next = await issueTokensInternal({
      subject: existing.subject,
      claims: existing.claims,
      familyId: existing.familyId,
    });

    await config.store.markReplaced(existing.id, next.refreshTokenId, now);

    return {
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
      accessTokenExpiresAt: next.accessTokenExpiresAt,
      refreshTokenExpiresAt: next.refreshTokenExpiresAt,
      tokenType: "Bearer",
    };
  }

  async function revoke(refreshToken: string): Promise<void> {
    const existing = await config.store.findByHash(hashToken(refreshToken));
    if (!existing || existing.revokedAt) return;
    await config.store.revoke(existing.id, clock.now());
  }

  async function revokeAllForSubject(subject: string): Promise<void> {
    await config.store.revokeAllForSubject(subject, clock.now());
  }

  return {
    issueTokens,
    verifyAccessToken,
    refresh,
    revoke,
    revokeAllForSubject,
  };
}
