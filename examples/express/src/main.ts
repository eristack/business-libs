import cors from "cors";
import express from "express";
import { eq } from "drizzle-orm";
import { createLogger } from "@eristack/logger";
import { createLoggerMiddleware } from "@eristack/logger/express";
import {
  ConfigurationError,
  createJwtAuth,
  UsernameTakenError,
} from "@eristack/jwt-auth";
import {
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
} from "@eristack/jwt-auth/drizzle";
import {
  createExpressRequireAuth,
  createJwtAuthRouter,
  type AuthedRequest,
} from "@eristack/jwt-auth/express";
import { createAppDatabase } from "./db/client.js";
import { users } from "./db/schema.js";
import { createOrdersRouter } from "./orders/router.js";
import { seedOrdersDemo } from "./orders/seed-orders.js";

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-change-me";
const port = Number(process.env.PORT ?? 3001);

// 1) App owns DB + Drizzle migrations
const { db, refreshTokenTable, credentialsTable, file } = createAppDatabase();

// 2) Inject app `db` into package stores
const store = createDrizzleRefreshTokenStore({
  dialect: "sqlite",
  db,
  table: refreshTokenTable,
});
const credentials = createDrizzleCredentialStore({
  dialect: "sqlite",
  db,
  table: credentialsTable,
});

// 3) Inject stores into core
const jwtAuth = createJwtAuth({
  accessSecret,
  store,
  credentials,
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
});

async function seedDemoUser() {
  const id = "user-1";
  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      id,
      displayName: "Demo User",
      createdAt: new Date(),
    });
  }

  try {
    await jwtAuth.registerCredentials({
      subject: id,
      username: "demo",
      password: "password123",
    });
  } catch (error) {
    if (
      error instanceof UsernameTakenError ||
      (error instanceof ConfigurationError &&
        error.message.includes("credentials already exist"))
    ) {
      return;
    }
    throw error;
  }
}

await seedDemoUser();
await seedOrdersDemo(db);

const app = express();
const log = createLogger({ name: "example-express" });
app.use(createLoggerMiddleware({ logger: log }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, example: "express", db: file });
});

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

app.use("/orders", createOrdersRouter({ db, jwtAuth }));

app.listen(port, () => {
  console.log(`[@eristack/example-express] http://localhost:${port}`);
  console.log(`  sqlite db: ${file}`);
  console.log(`  demo login: username=demo password=password123`);
  console.log(`  POST   /auth/login              { "username": "demo", "password": "password123" }`);
  console.log(`  POST   /auth/refresh            { "refreshToken": "..." }`);
  console.log(`  GET    /auth/sessions           Authorization: Bearer <accessToken>`);
  console.log(`  DELETE /auth/sessions/:id       Authorization: Bearer <accessToken>`);
  console.log(`  GET    /me                      Authorization: Bearer <accessToken>`);
  console.log(`  GET    /orders?…                data-grid JSON search (auth)`);
  console.log(`  GET    /orders/:id              order + lines + sums (auth)`);
});
