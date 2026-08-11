# Express + `@eristack/jwt-auth`

Minimal API showing the Express adapter:

- `createJwtAuth` + in-memory refresh store
- `createJwtAuthRouter` → `/auth/issue|refresh|logout|logout-all`
- `createExpressRequireAuth` → `GET /me`

## Run

```bash
# from repo root (builds jwt-auth if needed)
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-express dev
```

Server defaults to `http://localhost:3001`.

## Try it

```bash
# issue tokens (stand-in for post-login)
curl -s http://localhost:3001/auth/issue \
  -H 'content-type: application/json' \
  -d '{"subject":"user-1","claims":{"role":"admin"}}' | jq

# copy accessToken / refreshToken from the response, then:
curl -s http://localhost:3001/me \
  -H "authorization: Bearer $ACCESS_TOKEN" | jq

curl -s http://localhost:3001/auth/refresh \
  -H 'content-type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | jq
```

Use this server as the backend for [`../react`](../react).
