# Client vs React adapters

## Decision

Mirror the **rest → express/nest** layering on the frontend:

| Layer | Role | Framework |
| --- | --- | --- |
| `/client` | HTTP transport + (jwt) token machine | None — Vue/Svelte/etc. can wrap later |
| `/react` | TanStack **Query** for server state, TanStack **Form** helpers for mutations | React only |

Rules:

1. React never calls `fetch` / builds URLs — only `client.*`.
2. App owns `QueryClientProvider` (library does not create a global client).
3. Auth identity (`status` / access token) stays on the jwt-auth **client** subscribe model — not Query cache.
4. Lists/sessions/formats use Query; login/create/update use Mutation (+ optional Form option factories).
5. No UI widgets (`<input>`, shadcn) in packages.
