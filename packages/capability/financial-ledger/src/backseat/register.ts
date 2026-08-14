import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createFinancialLedger,
  type FinancialLedger,
  type FinancialPostInput,
} from "../core/create-financial-ledger.js";

export type RegisterFinancialLedgerBackseatOptions = {
  basePath?: string;
  ledger?: FinancialLedger;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerFinancialLedgerBackseat(
  api: Backseat,
  options: RegisterFinancialLedgerBackseatOptions = {},
): FinancialLedger {
  const ledgerStore = createBackseatLedgerStore({ store: api.store });
  const ledger =
    options.ledger ??
    createFinancialLedger({
      store: ledgerStore,
    });
  const base = normalizeBasePath(options.basePath ?? "/financial-ledger");

  api.registerRoute({
    method: "POST",
    path: `${base}/post`,
    name: "financial-ledger.post",
    handler: async (ctx) => {
      const body = ctx.json<FinancialPostInput>();
      const entry = await ledger.post(body);
      return { status: 201, body: entry };
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/entries`,
    name: "financial-ledger.list",
    handler: async (ctx) => {
      const accountId = ctx.query("accountId");
      const currency = ctx.query("currency");
      if (!accountId || !currency) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "accountId and currency required",
            },
          },
        };
      }
      const entries = await ledger.list(accountId, currency);
      return { status: 200, body: entries };
    },
  });

  api.registerAction("financialLedger.post", async ({ input }) =>
    ledger.post(input as FinancialPostInput),
  );

  return ledger;
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
