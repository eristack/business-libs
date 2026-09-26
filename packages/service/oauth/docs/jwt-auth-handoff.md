---
title: jwt-auth handoff
description: OAuth proves identity; jwt-auth issues your app session.
---

# jwt-auth handoff

```text
OAuth consumer  →  profile (provider + sub)
       →  your upsert user
       →  jwt-auth.issueTokens({ subject: user.id, claims })
       →  SPA stores access + refresh (jwt-auth client)
```

Never call `issueTokens` on unverified callbacks. Gate `POST /auth/issue` in production — see [jwt-auth security](/docs/jwt-auth/security).

IdP tokens (`result.tokens.accessToken`) are for **calling the IdP** or offline Google APIs — not your ERP API. Your API continues to use **jwt-auth** access JWTs.

Provider (authorization server) tokens are for **third-party** clients — separate from jwt-auth refresh tokens.
