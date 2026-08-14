import type { Backseat } from "@eristack/backseat";
import { createHashChainedLedger } from "../core/create-ledger.js";
import type {
  CreateHashChainedLedgerOptions,
  HashChainedLedger,
} from "../core/types.js";
import { createBackseatLedgerStore } from "./ledger-store.js";

export type RegisterHashChainedLedgerBackseatOptions = {
  /** Backseat route prefix, e.g. `/ledger`. */
  basePath?: string;
  ledger?: CreateHashChainedLedgerOptions;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

function chainIdFrom(ctx: { params: Record<string, string> }): string {
  const chainId = ctx.params.chainId;
  if (!chainId) {
    throw new Error("chainId path param required");
  }
  return chainId;
}

/** Register hash-chained ledger HTTP + named actions on a Backseat engine. */
export function registerHashChainedLedgerBackseat(
  api: Backseat,
  options: RegisterHashChainedLedgerBackseatOptions = {},
): HashChainedLedger {
  const ledgerStore = createBackseatLedgerStore({ store: api.store });
  const ledger = createHashChainedLedger({
    store: ledgerStore,
    ...options.ledger,
  });
  const base = normalizeBasePath(options.basePath ?? "/ledger");

  api.registerRoute({
    method: "GET",
    path: `${base}/chains/:chainId/entries`,
    name: "hash-chained-ledger.list",
    handler: async (ctx) => {
      try {
        const chainId = chainIdFrom(ctx);
        const entries = await ledger.list(chainId);
        return { status: 200, body: entries };
      } catch {
        return {
          status: 400,
          body: {
            error: { code: "VALIDATION_ERROR", message: "chainId required" },
          },
        };
      }
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/chains/:chainId/tip`,
    name: "hash-chained-ledger.tip",
    handler: async (ctx) => {
      const tip = await ledger.tip(chainIdFrom(ctx));
      return { status: 200, body: tip };
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/chains/:chainId/snapshot`,
    name: "hash-chained-ledger.snapshot",
    handler: async (ctx) => {
      const snapshot = await ledger.snapshot(chainIdFrom(ctx));
      return { status: 200, body: snapshot };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/chains/:chainId/append`,
    name: "hash-chained-ledger.append",
    handler: async (ctx) => {
      const body = ctx.json<Record<string, unknown>>();
      const chainId = chainIdFrom(ctx);
      const entry = await ledger.append({
        chainId,
        openingBalance:
          typeof body.openingBalance === "string" ? body.openingBalance : undefined,
        inAmount: typeof body.inAmount === "string" ? body.inAmount : undefined,
        outAmount: typeof body.outAmount === "string" ? body.outAmount : undefined,
        adjustment:
          typeof body.adjustment === "string" ? body.adjustment : undefined,
        entryType: String(body.entryType ?? "movement"),
        entryTypeId: String(body.entryTypeId ?? chainId),
        occurredAt:
          typeof body.occurredAt === "string" || body.occurredAt instanceof Date
            ? (body.occurredAt as string | Date)
            : undefined,
        id: typeof body.id === "string" ? body.id : undefined,
        meta:
          body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
            ? (body.meta as Record<string, unknown>)
            : undefined,
      });
      return { status: 201, body: entry };
    },
  });

  api.registerRoute({
    method: "POST",
    path: `${base}/chains/:chainId/verify`,
    name: "hash-chained-ledger.verify",
    handler: async (ctx) => {
      const result = await ledger.verify(chainIdFrom(ctx));
      return { status: 200, body: result };
    },
  });

  api.registerAction("hashChainedLedger.append", async ({ input }) => {
    const payload = input as {
      chainId: string;
      openingBalance?: string;
      inAmount?: string;
      outAmount?: string;
      adjustment?: string;
      entryType: string;
      entryTypeId: string;
      occurredAt?: string | Date;
      id?: string;
      meta?: Record<string, unknown>;
    };
    return ledger.append(payload);
  });

  return ledger;
}

export { createBackseatLedgerStore } from "./ledger-store.js";
export { HASH_CHAINED_LEDGER_COLLECTIONS } from "./collections.js";
export type { CreateBackseatLedgerStoreOptions } from "./ledger-store.js";
