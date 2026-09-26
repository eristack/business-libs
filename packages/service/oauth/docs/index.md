---
title: OAuth
description: OAuth2 client (Google/OIDC login) and provider (your API as authorization server).
---

# @eristack/oauth

| Entry | Role |
| --- | --- |
| `@eristack/oauth` | `createOAuthConsumer`, PKCE, pending login store |
| `@eristack/oauth/client` | `createGoogleOAuthDriver`, `createOidcOAuthDriver` |
| `@eristack/oauth/provider` | `createOAuthProvider` — register clients, auth codes, token endpoint |
| `@eristack/oauth/drizzle` | Pending logins + provider tables |
| `@eristack/oauth/express` | Consumer + provider routers |

**Not** a replacement for [`@eristack/jwt-auth`](/docs/jwt-auth) — after OAuth login, issue your JWT with `issueTokens`.

Next: [Getting started](./getting-started.md) · [Provider](./provider.md) · [jwt-auth handoff](./jwt-auth-handoff.md)
