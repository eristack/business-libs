import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/sendgrid/index.ts",
    "src/postmark/index.ts",
    "src/mailgun/index.ts",
    "src/twilio/index.ts",
    "src/vonage/index.ts",
    "src/meta-whatsapp/index.ts",
    "src/drizzle/index.ts",
    "src/rest/index.ts",
    "src/express/index.ts",
    "src/nest/index.ts",
    "src/testing/index.ts",
    "src/zod/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
    "express",
    "zod",
  ],
});
