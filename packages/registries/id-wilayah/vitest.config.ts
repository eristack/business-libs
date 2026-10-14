import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Gunzip + ~92k row parse/build exceeds default 5s on CI runners.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
