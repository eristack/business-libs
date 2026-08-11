# React + `@eristack/jwt-auth`

Full demo UI (app-owned) wired to the Express example:

| Action | API |
| --- | --- |
| Sign in | `client.issue` → `POST /auth/issue` |
| Profile | `GET /me` with Bearer access token |
| Active sessions | `client.listSessions` → `GET /auth/sessions` |
| Revoke session | `client.revokeSession` → `DELETE /auth/sessions/:id` |
| Log out | `client.logout` → `POST /auth/logout` |
| Log out everywhere | `client.logoutAll` → `POST /auth/logout-all` |
| Refresh tokens | `client.refresh` → `POST /auth/refresh` |

Injected at the composition root (`main.tsx`): `baseUrl`, `storage`, `fetch`.

## Run

```bash
# terminal 1 — API with Drizzle SQLite
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-express dev

# terminal 2 — UI
pnpm --filter @eristack/example-react dev
```

Open `http://localhost:5173`. Vite proxies `/auth` and `/me` to `localhost:3001`.

Optional: `VITE_API_BASE_URL=https://api.example.com` if not using the proxy.
