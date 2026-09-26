import express from "express";
import { createOAuthConsumer } from "../src/core/create-oauth-consumer.js";
import { createMemoryOAuthPendingStore } from "../src/core/memory-pending-store.js";
import { createMemoryOAuthIdpDriver } from "../src/client/memory-idp-driver.js";
import { createOAuthConsumerRouter } from "../src/express/index.js";

const REDIRECT = "https://app.test/oauth/callback";

export function createTestOAuthConsumerApp() {
  const consumer = createOAuthConsumer({
    drivers: { memory: createMemoryOAuthIdpDriver("memory") },
    pendingStore: createMemoryOAuthPendingStore(),
    allowedRedirectUris: [REDIRECT],
  });

  const app = express();
  app.use("/oauth", createOAuthConsumerRouter({ consumer }));
  return { app, consumer, redirectUri: REDIRECT };
}
