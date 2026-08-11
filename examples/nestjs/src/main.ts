import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const port = Number(process.env.PORT ?? 3002);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`[@eristack/example-nestjs] http://localhost:${port}`);
  console.log(`  POST /auth/issue   { "subject": "user-1", "claims": { "role": "admin" } }`);
  console.log(`  POST /auth/refresh { "refreshToken": "..." }`);
  console.log(`  GET  /me           Authorization: Bearer <accessToken>`);
}

void bootstrap();
