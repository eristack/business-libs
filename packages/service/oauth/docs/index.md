---
title: OAuth
description: OAuth2 client drivers (Google, Microsoft, GitHub, …) and authorization-server provider.
---

# @eristack/oauth

One package, **two roles** — do not mix them with `@eristack/jwt-auth` refresh tokens.

| Entry | Role |
| --- | --- |
| `@eristack/oauth` | `createOAuthConsumer`, PKCE, pending login store |
| `@eristack/oauth/client` | **17+ preset IdP drivers** + `createOidcOAuthDriver` / `createOAuth2Driver` |
| `@eristack/oauth/provider` | Your API as authorization server (partner clients) |
| `@eristack/oauth/drizzle` | Pending logins + provider tables |
| `@eristack/oauth/express` | Consumer + provider routers (`GET\|POST` callback for Apple) |

## Consumer flow (Sign in with …)

```text
Browser → GET /oauth/google/login?redirect_uri=…
       → IdP (PKCE)
       → GET|POST /oauth/google/callback
       → upsert user from profile
       → jwt-auth.issueTokens({ subject })
```

## Provider flow (partners call your API)

User already logged in via jwt-auth → consent → authorization code → `POST /oauth/as/token` → opaque partner access token.

## Docs map

| Page | Read when |
| --- | --- |
| [Getting started](./getting-started.md) | First consumer wiring + Express |
| [**IdP drivers**](./drivers.md) | Pick Google, Microsoft, GitHub, Apple, Okta, … |
| [jwt-auth handoff](./jwt-auth-handoff.md) | Session after OAuth |
| [Provider](./provider.md) | Inbound OAuth for integrators |
| [Database](./database.md) | Drizzle tables |

## Compose with other service packages

| Need | Package |
| --- | --- |
| App JWT + refresh after login | [`@eristack/jwt-auth`](/docs/jwt-auth/getting-started) |
| Magic-link / OTP **delivery** | [`@eristack/comms`](/docs/comms/getting-started) (email/SMS — not login) |
| Checkout after authenticated user | [`@eristack/payment-manager`](/docs/payment-manager/getting-started) |
