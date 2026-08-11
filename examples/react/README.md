# React + `@eristack/jwt-auth`

Vite app using the headless client/React bindings:

- `createJwtAuthClient`
- `JwtAuthProvider` / `useJwtAuth`

Talks to [`../express`](../express) via the Vite proxy (`/auth`, `/me` → `localhost:3001`).

## Run

```bash
# terminal 1
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-express dev

# terminal 2
pnpm --filter @eristack/example-react dev
```

Open `http://localhost:5173`, issue tokens for a subject, then call `GET /me`.
