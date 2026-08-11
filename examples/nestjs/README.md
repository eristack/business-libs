# NestJS + `@eristack/jwt-auth`

Minimal Nest app showing:

- `JwtAuthModule.register({ jwtAuth })` (ships `JwtAuthController` at `/auth/*`)
- `JwtAuthGuard` on `GET /me`

## Run

```bash
pnpm --filter @eristack/jwt-auth build
pnpm --filter @eristack/example-nestjs dev
```

Server defaults to `http://localhost:3002`.

## Try it

```bash
curl -s http://localhost:3002/auth/issue \
  -H 'content-type: application/json' \
  -d '{"subject":"user-1","claims":{"role":"admin"}}' | jq

curl -s http://localhost:3002/me \
  -H "authorization: Bearer $ACCESS_TOKEN" | jq
```
