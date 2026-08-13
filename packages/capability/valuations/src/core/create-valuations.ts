import Decimal from "decimal.js";
import {
  createHashChainedLedger,
  type CreateHashChainedLedgerOptions,
  type HashChainedLedger,
  type LedgerEntry,
} from "@eristack/hash-chained-ledger";
import {
  issueFromLayers,
  receiveIntoLayers,
  type CostLayer,
  type IssueResult,
  type ValuationMethod,
} from "./methods.js";

export type ValuationKey = {
  productId: string;
  lotId?: string;
  currency: string;
};

export function valuationChainId(
  key: ValuationKey,
  kind: "qty" | "value",
): string {
  const lot = key.lotId?.trim() || "_";
  return `val:${kind}:${key.productId}:${lot}:${key.currency}`;
}

export type LayerStore = {
  get(key: ValuationKey): Promise<CostLayer[]>;
  set(key: ValuationKey, layers: CostLayer[]): Promise<void>;
};

export type ValuationEngine = {
  ledger: HashChainedLedger;
  method: ValuationMethod;
  receive(input: {
    key: ValuationKey;
    qty: string;
    unitCost: string;
    entryTypeId: string;
    receivedAt?: string;
    layerId?: string;
    expiresAt?: string;
    standardUnitCost?: string;
  }): Promise<{
    layers: CostLayer[];
    qtyEntry: LedgerEntry;
    valueEntry: LedgerEntry;
  }>;
  issue(input: {
    key: ValuationKey;
    qty: string;
    entryTypeId: string;
    layerId?: string;
  }): Promise<{
    result: IssueResult;
    qtyEntry: LedgerEntry;
    valueEntry: LedgerEntry;
  }>;
  layers(key: ValuationKey): Promise<CostLayer[]>;
  verify(key: ValuationKey): Promise<{ qty: boolean; value: boolean }>;
};

export function createValuationEngine(options: {
  method: ValuationMethod;
  ledger: CreateHashChainedLedgerOptions;
  layers: LayerStore;
  idFactory?: () => string;
  now?: () => Date;
}): ValuationEngine {
  const ledger = createHashChainedLedger(options.ledger);
  const idFactory = options.idFactory ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => new Date());
  const method = options.method;

  return {
    ledger,
    method,

    async receive(input) {
      const layers = await options.layers.get(input.key);
      const receivedAt = input.receivedAt ?? now().toISOString();
      const next = receiveIntoLayers({
        layers,
        method,
        qty: input.qty,
        unitCost: input.unitCost,
        currency: input.key.currency,
        receivedAt,
        layerId: input.layerId ?? idFactory(),
        expiresAt: input.expiresAt,
        standardUnitCost: input.standardUnitCost,
      });
      await options.layers.set(input.key, next.layers);

      const tipQty = await ledger.tip(valuationChainId(input.key, "qty"));
      const tipVal = await ledger.tip(valuationChainId(input.key, "value"));
      const valueIn = new Decimal(input.qty).times(input.unitCost).toFixed();

      const qtyEntry = await ledger.append({
        chainId: valuationChainId(input.key, "qty"),
        openingBalance: tipQty ? undefined : "0",
        inAmount: input.qty,
        entryType: "receive",
        entryTypeId: input.entryTypeId,
        meta: {
          method,
          productId: input.key.productId,
          lotId: input.key.lotId ?? null,
        },
      });
      const valueEntry = await ledger.append({
        chainId: valuationChainId(input.key, "value"),
        openingBalance: tipVal ? undefined : "0",
        inAmount: valueIn,
        entryType: "receive",
        entryTypeId: input.entryTypeId,
        meta: {
          method,
          unitCost: input.unitCost,
          averageUnitCost: next.averageUnitCost ?? null,
        },
      });
      return { layers: next.layers, qtyEntry, valueEntry };
    },

    async issue(input) {
      const layers = await options.layers.get(input.key);
      const result = issueFromLayers({
        layers,
        method,
        qty: input.qty,
        layerId: input.layerId,
      });
      await options.layers.set(input.key, result.layers);

      const tipQty = await ledger.tip(valuationChainId(input.key, "qty"));
      const tipVal = await ledger.tip(valuationChainId(input.key, "value"));

      const qtyEntry = await ledger.append({
        chainId: valuationChainId(input.key, "qty"),
        openingBalance: tipQty ? undefined : "0",
        outAmount: input.qty,
        entryType: "issue",
        entryTypeId: input.entryTypeId,
        meta: { method, picks: result.picks },
      });
      const valueEntry = await ledger.append({
        chainId: valuationChainId(input.key, "value"),
        openingBalance: tipVal ? undefined : "0",
        outAmount: result.totalCost,
        entryType: "issue",
        entryTypeId: input.entryTypeId,
        meta: { method, picks: result.picks },
      });
      return { result, qtyEntry, valueEntry };
    },

    layers(key) {
      return options.layers.get(key);
    },

    async verify(key) {
      const qty = await ledger.check(valuationChainId(key, "qty"));
      const value = await ledger.check(valuationChainId(key, "value"));
      return { qty: qty.ok, value: value.ok };
    },
  };
}
