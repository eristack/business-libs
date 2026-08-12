# Express + jwt-auth + data-grid (Drizzle SQLite)

Injection path:

1. App schema: [`src/db/schema.ts`](./src/db/schema.ts) (users, jwt-auth tables, **customers / products / orders / order_lines**)
2. App migrations: `pnpm db:generate` → committed under [`drizzle/`](./drizzle)
3. App opens SQLite and runs `migrate()` — [`src/db/client.ts`](./src/db/client.ts)
4. jwt-auth stores + **orders list** use the same injected `db`

## Orders data-grid (battle test)

`GET /orders` projects a flat list row with:

- **Relations:** customer name/email/region/active, assignee display name
- **Aggregates:** `lineCount` (`COUNT`), `totalMinor` (`SUM qty × unit_price`)
- **Money:** `total` formatted via `@eristack/money`
- **Query:** `executeDrizzleList` from `@eristack/data-grid/drizzle` (app owns the join projection; library runs filter/sort/count/page)

`GET /orders/:id` returns the same header plus joined line items (product SKU/name/category + line totals).

## Run

```bash
pnpm --filter @eristack/data-grid build
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/money build
pnpm --filter @eristack/example-express db:generate   # after schema changes
pnpm --filter @eristack/example-express dev
```

SQLite defaults to `data/express-jwt-auth.sqlite` (`SQLITE_PATH` to override).

## Try the grid

```bash
TOKEN=$(curl -s http://localhost:3001/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"demo","password":"password123"}' | jq -r .accessToken)

# Open + fulfilled, active customers, total ≥ $500, sort by total desc
curl -sG "http://localhost:3001/orders" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'mode=advanced' \
  --data-urlencode 'filters={"type":"group","logic":"and","children":[{"type":"clause","field":"status","op":"in","value":["open","fulfilled"]},{"type":"clause","field":"customerActive","op":"eq","value":true},{"type":"clause","field":"totalMinor","op":"gte","value":50000}]}' \
  --data-urlencode 'sorts=[{"field":"totalMinor","dir":"desc"}]' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=10' | jq

curl -s http://localhost:3001/orders/ord-1001 \
  -H "Authorization: Bearer $TOKEN" | jq
```

Backend for [`../react`](../react).
