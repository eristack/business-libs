import { Inject, Module, type OnModuleInit } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  ConfigurationError,
  createJwtAuth,
  UsernameTakenError,
  type JwtAuth,
} from "@eristack/jwt-auth";
import {
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
} from "@eristack/jwt-auth/drizzle";
import { JWT_AUTH, JwtAuthModule } from "@eristack/jwt-auth/nest";
import type { AppDatabase } from "./database/create-db.js";
import { DatabaseModule } from "./database/database.module.js";
import { users } from "./database/schema.js";
import { APP_DATABASE } from "./database/tokens.js";
import { MeController } from "./me.controller.js";

const accessSecret =
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-change-me";

@Module({
  imports: [
    DatabaseModule,
    // DB is created by DatabaseModule and injected here — not by jwt-auth.
    JwtAuthModule.registerAsync({
      inject: [APP_DATABASE],
      useFactory: (appDb: AppDatabase) => ({
        jwtAuth: createJwtAuth({
          accessSecret,
          store: createDrizzleRefreshTokenStore({
            dialect: "sqlite",
            db: appDb.db,
            table: appDb.table,
          }),
          credentials: createDrizzleCredentialStore({
            dialect: "sqlite",
            db: appDb.db,
            table: appDb.credentialsTable,
          }),
          accessTokenTtl: "15m",
          refreshTokenTtl: "30d",
        }),
        refreshTokenTransport: "body",
      }),
    }),
  ],
  controllers: [MeController],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(APP_DATABASE) private readonly appDb: AppDatabase,
    @Inject(JWT_AUTH) private readonly jwtAuth: JwtAuth,
  ) {}

  async onModuleInit() {
    const id = "user-1";
    const existing = await this.appDb.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      await this.appDb.db.insert(users).values({
        id,
        displayName: "Demo User",
        createdAt: new Date(),
      });
    }

    try {
      await this.jwtAuth.registerCredentials({
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
}
