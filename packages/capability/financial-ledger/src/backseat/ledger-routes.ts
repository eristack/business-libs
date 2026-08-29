import { validationError } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { FinancialLedger, FinancialPostInput } from "../core/create-financial-ledger.js";

export function createFinancialLedgerRoutes(ledger: FinancialLedger) {
  return [
    {
      method: "POST" as const,
      segment: "/post",
      name: "financial-ledger.post",
      handler: async (ctx: BackseatHandlerContext) => ({
        status: 201,
        body: await ledger.post(ctx.json<FinancialPostInput>()),
      }),
    },
    {
      method: "GET" as const,
      segment: "/entries",
      name: "financial-ledger.list",
      handler: async (ctx: BackseatHandlerContext) => {
        const accountId = ctx.query("accountId");
        const currency = ctx.query("currency");
        if (!accountId || !currency) {
          return validationError("accountId and currency required");
        }
        return { status: 200, body: await ledger.list(accountId, currency) };
      },
    },
  ] satisfies Array<{
    method: "GET" | "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
