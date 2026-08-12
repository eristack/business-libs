# React + `@eristack/jwt-auth` + `@eristack/data-grid`

Full demo UI (app-owned) wired to the Express example:

| Action | API |
| --- | --- |
| Sign in | `useLogin` → `POST /auth/login` |
| Profile | `GET /me` with Bearer access token |
| **Orders grid** | `useDataGridList` → `GET /orders?…` (JSON filters/sorts) |
| Order detail | `GET /orders/:id` (lines + sums) |
| Active sessions | `useAuthSessions` → `GET /auth/sessions` |
| Revoke session | `useRevokeSession` → `DELETE /auth/sessions/:id` |
| Log out | `useLogout` → `POST /auth/logout` |
| Log out everywhere | `useLogoutAll` → `POST /auth/logout-all` |
| Refresh tokens | `client.refresh` → `POST /auth/refresh` |

Injected at the composition root (`main.tsx`): `baseUrl`, `storage`, `fetch`, and a TanStack `QueryClientProvider`.

React helpers wrap `/client` — they never call `fetch` themselves.

The orders panel filters on **relation** fields (`customerRegion`, `customerActive`) and **aggregates** (`totalMinor`, `lineCount`), then opens a detail view with joined line items.

## Run

```bash
# terminal 1 — API with Drizzle SQLite
pnpm --filter @eristack/data-grid build
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/money build
pnpm --filter @eristack/example-express dev

# terminal 2 — UI
pnpm --filter @eristack/example-react dev
```

Open `http://localhost:5173`. Vite proxies `/auth`, `/me`, and `/orders` to `localhost:3001`.

Optional: `VITE_API_BASE_URL=https://api.example.com` if not using the proxy.
