# Examples

Runnable apps that wire `@eristack/*` packages into real frameworks. Prefer these over inventing integration patterns.

| Example | Stack | What it proves |
| --- | --- | --- |
| [`express`](./express) | Express 5 + Drizzle SQLite | App schema/migrations + injected `db` → jwt-auth + **orders data-grid** (joins, SUM/COUNT) |
| [`nestjs`](./nestjs) | NestJS 11 + Drizzle SQLite | App schema/migrations + `registerAsync` injects `db` |
| [`react`](./react) | Vite + React 19 | App-injected `baseUrl` / `storage` + jwt-auth + **data-grid list UI** |

Point the React app at the Express example (default `http://localhost:3001`).

Credential checking / password hashing is intentionally out of scope for issue-token demos — the React login uses `POST /auth/login` against the seeded `demo` user.
