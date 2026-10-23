import express from "express";
import { createPaymentManager } from "../src/core/create-payment-manager.js";
import {
  createMemoryPaymentDriver,
  createMemoryPaymentManagerStore,
} from "../src/testing/index.js";
import { createPaymentManagerRouter } from "../src/express/index.js";

export function createTestPaymentManagerApp(gateway = "memory") {
  const paymentManager = createPaymentManager({
    store: createMemoryPaymentManagerStore(),
    drivers: {
      [gateway]: createMemoryPaymentDriver(gateway),
    },
  });

  const app = express();
  app.use(express.json());
  app.use("/payments", createPaymentManagerRouter({ paymentManager }));

  return { app, paymentManager };
}
