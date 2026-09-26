# OAuth — client (consumer) vs provider (authorization server)

**Status:** brainstorm · **Layer:** Service (`packages/service/`)

## Short answer

**Separate the two roles.** They share OAuth2/OIDC vocabulary (redirect, code, PKCE, scopes) but not the same job, tables, or HTTP surface. Ship as **one npm package with two entrypoints** unless size forces a split later:

| Entry | Role | Typical ask |
| --- | --- | --- |
| `@eristack/oauth/client` | **Consumer / RP** — your app talks to Google, Microsoft, GitHub, partner OIDC | “Sign in with …”, “Connect QuickBooks” |
| `@eristack/oauth/provider` | **Authorization server** — third-party apps get tokens to call **your** API | “Partner integration OAuth”, “Mobile app uses Acme ERP login” |

Do **not** fold either into `@eristack/jwt-auth`. jwt-auth already documents the handoff: verify identity elsewhere → `issueTokens({ subject })`.

## Boundaries

```text
                    CONSUMER (client)                         YOUR APP
  User ──► Google/Microsoft ──► redirect ──► /oauth/callback ──► upsert user
                                                                    │
                                                                    ▼
                                                          jwt-auth.issueTokens
                                                          (your JWT + refresh)

                    PROVIDER (server)                         YOUR APP
  Partner app ──► /oauth/authorize (user already logged in via jwt-auth)
              ──► consent ──► code ──► /oauth/token ──► access token for partner
              (scopes, client_id, redirect allowlist — NOT the same as jwt refresh)
```

| Concern | `@eristack/jwt-auth` | `@eristack/oauth/client` | `@eristack/oauth/provider` |
| --- | --- | --- | --- |
| Username/password | yes (credentials store) | no | no |
| Session for **your** SPA/API | yes (JWT + refresh) | no — ends at `issueTokens` | no — uses existing session to approve |
| Outbound “login with X” | app wires today | **yes** (PKCE, state, token exchange) | no |
| Inbound “others login with us” | explicitly **not** IdP | no | **yes** |
| Drizzle tables | credentials, refresh | `oauth_connections` / link rows (app-owned user fk) | `oauth_clients`, codes, provider tokens |

## Recommended package shape (mirror payment-manager / file-manager)

**`@eristack/oauth`** (service, alpha)

- **Core:** `createOAuthClient`, `createOAuthProvider` (framework-free), shared `validateRedirectUri`, PKCE helpers, state/nonce store interface
- **`/client`:** `createGoogleOAuthDriver`, `createOidcDiscoveryDriver`, generic authorization URL + code exchange
- **`/provider`:** registerClient, authorize endpoint handler, token endpoint (authorization code + refresh for **external** clients), optional scope registry
- **`/drizzle`:** separate table factories — client connections vs provider clients/codes/tokens
- **`/express`**, **`/rest`**, **`/client` (HTTP)**, **`/react` (hooks)**, **`/backseat`**, **`/testing`** memory stores
- **Peers:** optional `jose` or Node crypto for JWT at provider token endpoint if you mint JWT access tokens for integrators

### Consumer flow (≤3 files for agents)

1. Skill + `docs/getting-started.md` — register redirect URI, PKCE login route, callback → upsert user → `jwt-auth.issueTokens`
2. Drizzle optional — persist refresh tokens **from Google** only if integration needs offline access (Drive, etc.); **login-only** may skip storage

### Provider flow

Heavier: client registration UI, consent, scope ↔ rbac mapping, rotation, audit. **Later horizon** unless product requires “ERP as IdP” on day one.

## Build order

1. **`oauth/client`** — Google + generic OIDC discovery + Express callback route + tests (memory driver)
2. Document jwt-auth handoff in both packages’ getting-started
3. **`oauth/provider`** — minimal AS: confidential clients, auth code + PKCE, opaque access tokens, Drizzle
4. Optional: `@eristack/api-key` (brainstorm S17) for machine clients that should not use OAuth UI

## Names (locked direction)

| Avoid | Prefer |
| --- | --- |
| One mega “auth” package | `oauth` with `/client` + `/provider` |
| `oauth-bridge` only (old brainstorm S26) | **`@eristack/oauth`** — bridge is one consumer use case |
| Putting provider in jwt-auth | jwt-auth stays session spine for **your** users |

## Recipes (when shipped)

- `oauth-sign-in-google-microsoft` → oauth-client + jwt-auth-adapters
- `oauth-api-integrator` → oauth-provider + rbac + rest

## Related

- `@eristack/jwt-auth` — `issueTokens`, [tokens-and-refresh](../../packages/service/jwt-auth/docs/tokens-and-refresh.md)
- `@eristack/payment-manager` — same **service** pattern (drivers, webhooks, Drizzle history)
- Brainstorm S26 `@eristack/oauth-bridge` → superseded by **`@eristack/oauth/client`**
