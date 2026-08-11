# Examples

Runnable apps that wire `@eristack/*` packages into real frameworks. Prefer these over inventing integration patterns.

| Example | Stack | What it proves |
| --- | --- | --- |
| [`express`](./express) | Express 5 + Drizzle SQLite | App schema/migrations + injected `db` → store → router |
| [`nestjs`](./nestjs) | NestJS 11 + Drizzle SQLite | App schema/migrations + `registerAsync` injects `db` |
| [`react`](./react) | Vite + React 19 | App-injected `baseUrl` / `storage` into client + provider |

Point the React app at the Express example (default `http://localhost:3001`).

Credential checking / password hashing is intentionally out of scope — demos call `POST /auth/issue` with a subject, the same way a real login handler would after verifying credentials.
