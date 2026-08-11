import {
  createJwtAuth,
  createMemoryRefreshTokenStore,
  type JwtAuth,
} from "@eristack/jwt-auth";

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-change-me";

export const jwtAuth: JwtAuth = createJwtAuth({
  accessSecret,
  store: createMemoryRefreshTokenStore(),
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
});
