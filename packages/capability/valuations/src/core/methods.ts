import Decimal from "decimal.js";

export type ValuationMethod =
  | "fifo"
  | "lifo"
  | "fefo"
  | "hifo"
  | "lofo"
  | "movingAverage"
  | "weightedAverage"
  | "standardCost"
  | "specificIdentification";

export type CostLayer = {
  id: string;
  qty: string;
  unitCost: string;
  currency: string;
  receivedAt: string;
  /** Required for FEFO. */
  expiresAt?: string;
};

export type IssuePick = {
  layerId: string;
  qty: string;
  unitCost: string;
  cost: string;
};

export type IssueResult = {
  picks: IssuePick[];
  totalCost: string;
  layers: CostLayer[];
  /** Unit cost after moving/weighted average update (when applicable). */
  averageUnitCost?: string;
};

function d(v: string | number | Decimal) {
  return v instanceof Decimal ? v : new Decimal(v);
}

function money(v: Decimal) {
  return v.toFixed();
}

function sortLayers(
  layers: CostLayer[],
  method: ValuationMethod,
): CostLayer[] {
  const copy = [...layers];
  switch (method) {
    case "fifo":
      return copy.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    case "lifo":
      return copy.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    case "fefo":
      return copy.sort((a, b) => {
        const ae = a.expiresAt ?? "9999";
        const be = b.expiresAt ?? "9999";
        const c = ae.localeCompare(be);
        return c !== 0 ? c : a.receivedAt.localeCompare(b.receivedAt);
      });
    case "hifo":
      return copy.sort((a, b) => d(b.unitCost).cmp(d(a.unitCost)));
    case "lofo":
      return copy.sort((a, b) => d(a.unitCost).cmp(d(b.unitCost)));
    default:
      return copy;
  }
}

/**
 * Receive into layers (layer methods) or bump average (moving average).
 */
export function receiveIntoLayers(input: {
  layers: CostLayer[];
  method: ValuationMethod;
  qty: string;
  unitCost: string;
  currency: string;
  receivedAt: string;
  layerId: string;
  expiresAt?: string;
  /** Standard cost override when method is standardCost. */
  standardUnitCost?: string;
}): { layers: CostLayer[]; averageUnitCost?: string } {
  const qty = d(input.qty);
  if (qty.lte(0)) throw new Error("receive qty must be > 0");

  if (input.method === "fefo" && !input.expiresAt?.trim()) {
    throw new Error("fefo receive requires expiresAt");
  }

  if (input.method === "movingAverage" || input.method === "weightedAverage") {
    const onHand = input.layers.reduce((s, l) => s.plus(d(l.qty)), d(0));
    const onHandValue = input.layers.reduce(
      (s, l) => s.plus(d(l.qty).times(d(l.unitCost))),
      d(0),
    );
    const newValue = onHandValue.plus(qty.times(d(input.unitCost)));
    const newQty = onHand.plus(qty);
    const avg = newQty.eq(0) ? d(0) : newValue.div(newQty);
    return {
      layers: [
        {
          id: input.layerId,
          qty: money(newQty),
          unitCost: money(avg),
          currency: input.currency,
          receivedAt: input.receivedAt,
        },
      ],
      averageUnitCost: money(avg),
    };
  }

  const unitCost =
    input.method === "standardCost"
      ? (input.standardUnitCost ?? input.unitCost)
      : input.unitCost;

  return {
    layers: [
      ...input.layers,
      {
        id: input.layerId,
        qty: money(qty),
        unitCost,
        currency: input.currency,
        receivedAt: input.receivedAt,
        expiresAt: input.expiresAt,
      },
    ],
  };
}

/**
 * Issue qty using the selected valuation method.
 */
export function issueFromLayers(input: {
  layers: CostLayer[];
  method: ValuationMethod;
  qty: string;
  /** Required for specificIdentification. */
  layerId?: string;
}): IssueResult {
  let remaining = d(input.qty);
  if (remaining.lte(0)) throw new Error("issue qty must be > 0");

  if (input.method === "specificIdentification") {
    if (!input.layerId) {
      throw new Error("specificIdentification requires layerId");
    }
    const layer = input.layers.find((l) => l.id === input.layerId);
    if (!layer) throw new Error(`Layer ${input.layerId} not found`);
    if (d(layer.qty).lt(remaining)) {
      throw new Error("Insufficient qty on specified layer");
    }
    const cost = remaining.times(d(layer.unitCost));
    const layers = input.layers
      .map((l) =>
        l.id === layer.id
          ? { ...l, qty: money(d(l.qty).minus(remaining)) }
          : l,
      )
      .filter((l) => !d(l.qty).eq(0));
    return {
      picks: [
        {
          layerId: layer.id,
          qty: money(remaining),
          unitCost: layer.unitCost,
          cost: money(cost),
        },
      ],
      totalCost: money(cost),
      layers,
    };
  }

  if (input.method === "movingAverage" || input.method === "weightedAverage") {
    const layer = input.layers[0];
    if (!layer || d(layer.qty).lt(remaining)) {
      throw new Error("Insufficient quantity for average issue");
    }
    const cost = remaining.times(d(layer.unitCost));
    const nextQty = d(layer.qty).minus(remaining);
    return {
      picks: [
        {
          layerId: layer.id,
          qty: money(remaining),
          unitCost: layer.unitCost,
          cost: money(cost),
        },
      ],
      totalCost: money(cost),
      layers: nextQty.eq(0)
        ? []
        : [{ ...layer, qty: money(nextQty) }],
      averageUnitCost: layer.unitCost,
    };
  }

  // standardCost issues at each layer's unitCost (already set to standard on receive)
  const ordered = sortLayers(input.layers, input.method);
  const picks: IssuePick[] = [];
  const qtyLeft = new Map(ordered.map((l) => [l.id, d(l.qty)]));

  for (const layer of ordered) {
    if (remaining.lte(0)) break;
    const available = qtyLeft.get(layer.id) ?? d(0);
    if (available.lte(0)) continue;
    const take = Decimal.min(available, remaining);
    picks.push({
      layerId: layer.id,
      qty: money(take),
      unitCost: layer.unitCost,
      cost: money(take.times(d(layer.unitCost))),
    });
    qtyLeft.set(layer.id, available.minus(take));
    remaining = remaining.minus(take);
  }

  if (remaining.gt(0)) {
    throw new Error("Insufficient quantity across layers");
  }

  const layers = input.layers
    .map((l) => ({
      ...l,
      qty: money(qtyLeft.get(l.id) ?? d(l.qty)),
    }))
    .filter((l) => !d(l.qty).eq(0));

  const totalCost = picks.reduce((s, p) => s.plus(d(p.cost)), d(0));
  return { picks, totalCost: money(totalCost), layers };
}
