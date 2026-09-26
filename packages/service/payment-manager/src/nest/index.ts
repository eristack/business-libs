/**
 * Nest: mount Express router on a module path.
 *
 * ```ts
 * import { createPaymentManagerRouter } from "@eristack/payment-manager/express";
 * app.use("/payments", createPaymentManagerRouter({ paymentManager }));
 * ```
 */
export { createPaymentManagerRouter } from "../express/index.js";
