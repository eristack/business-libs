import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { APP_DATABASE } from "./database/tokens.js";
import type { AppDatabase } from "./database/create-db.js";

const port = Number(process.env.PORT ?? 3002);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { file } = app.get<AppDatabase>(APP_DATABASE);

  await app.listen(port);
  console.log(`[@eristack/example-nestjs] http://localhost:${port}`);
  console.log(`  sqlite db: ${file}`);
  console.log(`  demo login: username=demo password=password123`);
  console.log(
    `  POST   /auth/login              { "username": "demo", "password": "password123" }`,
  );
  console.log(`  POST   /auth/refresh            { "refreshToken": "..." }`);
  console.log(`  GET    /auth/sessions           Authorization: Bearer <accessToken>`);
  console.log(`  DELETE /auth/sessions/:id       Authorization: Bearer <accessToken>`);
  console.log(`  GET    /me                      Authorization: Bearer <accessToken>`);
  console.log(`  GET    /orders                  ?sort=-orderedAt&pageSize=10`);
}

void bootstrap();
