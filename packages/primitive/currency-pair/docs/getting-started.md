---
title: Getting started
description: Key an FX rate table by canonical pair, validate API params with Zod, and hand the rate to @eristack/money for conversion.
---

# Getting started

## Install

```bash
pnpm add @eristack/currency-pair @eristack/money zod
```

## The rate table is yours; the key is ours

```ts
import { pgTable, text, numeric, date, uniqueIndex } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const fxRates = pgTable(
  "fx_rates",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    pairKey: text("pair_key").notNull(),            // "USD/IDR" from formatPairKey
    rate: numeric("rate", { precision: 20, scale: 10 }).notNull(), // string in TS
    asOf: date("as_of", { mode: "string" }).notNull(),
  },
  (t) => [uniqueIndex("fx_rates_pair_asof_uq").on(t.pairKey, t.asOf)],
);
```

Storing the **key** (not two loose columns) means "usd/idr", "USD-IDR", and "IDR/USD" can never coexist as separate rows.

## Validate the request, then look up

```ts
import { z } from "zod";
import { currencyPairSchema } from "@eristack/currency-pair/zod";
import { formatPairKey, CurrencyPairParseError } from "@eristack/currency-pair";
import { Money, Conversion } from "@eristack/money";

const querySchema = z.object({
  base: z.string(),
  quote: z.string(),
  amount: z.string(), // money amounts stay strings
});

app.get("/fx/convert", async (req, res) => {
  const q = querySchema.parse(req.query);
  let pair;
  try {
    pair = currencyPairSchema.parse({ base: q.base, quote: q.quote });
  } catch (err) {
    // Zod wraps CurrencyPairParseError; surface a 400 with the message
    return res.status(400).json({ error: "INVALID_PAIR", message: String(err) });
  }

  const row = await db.query.fxRates.findFirst({
    where: (t, { eq }) => eq(t.pairKey, formatPairKey(pair)),
    orderBy: (t, { desc }) => desc(t.asOf),
  });
  if (!row) return res.status(404).json({ error: "RATE_NOT_FOUND", pair: formatPairKey(pair) });

  const converted = Money.of(q.amount, pair.base).with(
    Conversion.of({ base: pair.base, term: pair.quote, factor: row.rate }),
  );
  res.json({ pair: formatPairKey(pair), rate: row.rate, amount: converted.toJSON() });
});
```

## Reverse lookups

Vendors often quote only one direction. Try the inverse before returning 404:

```ts
import { invertPair, formatPairKey } from "@eristack/currency-pair";

const direct = await findRate(formatPairKey(pair));
if (direct) return direct.rate;
const inverse = await findRate(formatPairKey(invertPair(pair)));
if (inverse) return invertRateString(inverse.rate); // your decimal math — no floats
```

## Gotchas

- `normalizeCurrencyPair` consults `@eristack/money`'s currency registry. A code that is valid ISO 4217 but not registered there (custom or historical) throws `Unknown currency code` — register it in money first.
- `formatPairKey` and `invertPair` **re-validate** their input; passing a hand-built `{ base: "usd", quote: "idr" }` is fine, but an invalid one throws even though it type-checks.
- Same-currency "pairs" (`USD/USD`) are rejected on purpose — a 1.0 identity conversion is an app decision, not a pair.
- `CurrencyPairParseError.code` is `"CURRENCY_PAIR_PARSE_ERROR"` — branch on it, not the message.

## Testing

```ts
import { formatPairKey, normalizeCurrencyPair, CurrencyPairParseError } from "@eristack/currency-pair";
import { expect, it } from "vitest";

it("canonicalizes casing and whitespace", () => {
  expect(formatPairKey(normalizeCurrencyPair(" usd", "Idr "))).toBe("USD/IDR");
});

it("rejects identical codes", () => {
  expect(() => normalizeCurrencyPair("EUR", "eur")).toThrow(CurrencyPairParseError);
});
```
