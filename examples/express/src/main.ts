import cors from "cors";
import express from "express";
import {
  createJwtAuth,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth";
import {
  createExpressRequireAuth,
  createJwtAuthRouter,
  type AuthedRequest,
} from "@eristack/jwt-auth/express";

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-change-me";
const port = Number(process.env.PORT ?? 3001);

const jwtAuth = createJwtAuth({
  accessSecret,
  store: createMemoryRefreshTokenStore(),
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
});

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, example: "express" });
});

// Demo "login": your app would verify passwords first, then issue.
app.use(
  "/auth",
  createJwtAuthRouter({
    jwtAuth,
    refreshTokenTransport: "body",
  }),
);

app.get(
  "/me",
  createExpressRequireAuth({ jwtAuth }),
  (req: AuthedRequest, res) => {
    res.json({
      subject: req.auth!.subject,
      claims: req.auth!.claims,
    });
  },
);

app.listen(port, () => {
  console.log(`[@eristack/example-express] http://localhost:${port}`);
  console.log(
    `  POST /auth/issue   { "subject": "user-1", "claims": { "role": "admin" } }`,
  );
  console.log(`  POST /auth/refresh { "refreshToken": "..." }`);
  console.log(`  GET  /me           Authorization: Bearer <accessToken>`);
});
