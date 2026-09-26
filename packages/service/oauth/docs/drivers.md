---
title: IdP drivers
description: Preset OAuth2/OIDC drivers — Google, Microsoft, GitHub, Apple, enterprise IdPs, and custom OIDC.
---

# IdP drivers (`@eristack/oauth/client`)

Every preset implements the same **`OAuthConsumerDriver`** contract: PKCE authorization URL + code exchange → **`OAuthUserProfile`** + IdP tokens. Register only the providers you enable:

```ts
const consumer = createOAuthConsumer({
  drivers: {
    google: createGoogleOAuthDriver({ clientId, clientSecret }),
    microsoft: createMicrosoftOAuthDriver({ clientId, clientSecret, tenantId: "common" }),
    github: createGitHubOAuthDriver({ clientId, clientSecret }),
  },
  pendingStore,
  allowedRedirectUris: [redirectUri],
});
```

Express mounts **`GET /oauth/{provider}/login`** and **`GET|POST /oauth/{provider}/callback`**. Use **POST** for Sign in with Apple (`response_mode=form_post`) with `express.urlencoded({ extended: false })` on the callback route.

## Preset catalog

| Provider key | Factory | Default scopes | Notes |
| --- | --- | --- | --- |
| `google` | `createGoogleOAuthDriver` | `openid profile email` | Google Cloud OAuth client |
| `microsoft` | `createMicrosoftOAuthDriver` | `openid profile email offline_access` | `tenantId`: `common`, `organizations`, `consumers`, or tenant GUID |
| `github` | `createGitHubOAuthDriver` | `read:user user:email` | OAuth2 + REST profile (not OIDC userinfo) |
| `apple` | `createAppleOAuthDriver` | `name email` | JWT client secret via `createAppleClientSecret` or `resolveClientSecret`; **POST callback** |
| `facebook` | `createFacebookOAuthDriver` | `email public_profile` | Graph API profile |
| `linkedin` | `createLinkedInOAuthDriver` | `openid profile email` | OIDC userinfo |
| `gitlab` | `createGitLabOAuthDriver` | `openid profile email` | `baseUrl` for self-hosted |
| `discord` | `createDiscordOAuthDriver` | `identify email` | Bot/user apps |
| `slack` | `createSlackOAuthDriver` | `openid profile email` | Slack OpenID Connect |
| `okta` | `createOktaOAuthDriver` | `openid profile email` | Org domain |
| `auth0` | `createAuth0OAuthDriver` | `openid profile email` | Tenant domain |
| `keycloak` | `createKeycloakOAuthDriver` | `openid profile email` | Realm issuer URL |
| `amazon` | `createAmazonOAuthDriver` | `profile` | Login with Amazon |
| `twitter` | `createTwitterOAuthDriver` | `users.read tweet.read offline_access` | X OAuth 2.0 + users/me |
| `cognito` | `createCognitoOAuthDriver` | `openid profile email` | Hosted UI domain |
| `salesforce` | `createSalesforceOAuthDriver` | `openid profile email` | `environment`: `login` or `test` |
| `shopify` | `createShopifyOAuthDriver` | `openid email` | Shop subdomain; confirm PKCE for your app type |

Exported constants for UI and agents:

```ts
import {
  OAUTH_PRESET_PROVIDERS,
  OAUTH_PRESET_PROVIDER_CATALOG,
} from "@eristack/oauth/client";
```

## Microsoft / Entra ID

```ts
import { createMicrosoftOAuthDriver } from "@eristack/oauth/client";

createMicrosoftOAuthDriver({
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  tenantId: process.env.AZURE_TENANT_ID ?? "common",
});
```

`createAzureAdOAuthDriver` is an alias.

## GitHub

```ts
createGitHubOAuthDriver({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
});
```

## Sign in with Apple

```ts
createAppleOAuthDriver({
  clientId: process.env.APPLE_CLIENT_ID!,
  teamId: process.env.APPLE_TEAM_ID!,
  keyId: process.env.APPLE_KEY_ID!,
  privateKeyPem: process.env.APPLE_PRIVATE_KEY!,
});
```

```ts
app.use(express.urlencoded({ extended: false }));
app.use("/oauth", createOAuthConsumerRouter({ consumer, onCallback }));
```

## Custom OIDC (any issuer)

When no preset fits, use endpoints directly:

```ts
createOidcOAuthDriver({
  provider: "my-idp",
  clientId,
  clientSecret,
  authorizationEndpoint: "https://idp.example/authorize",
  tokenEndpoint: "https://idp.example/token",
  userinfoEndpoint: "https://idp.example/userinfo",
});
```

Discover endpoints from `/.well-known/openid-configuration`:

```ts
import { createOidcOAuthDriverFromIssuer } from "@eristack/oauth/client";

const driver = await createOidcOAuthDriverFromIssuer({
  provider: "authentik",
  issuer: "https://auth.example.com/application/o/my-app/",
  clientId,
  clientSecret,
});
```

## Custom OAuth2 (profile callback)

For APIs that are not OIDC, use `createOAuth2Driver` with `resolveProfile` — see `github-driver.ts` in the repo.

## After login

All drivers stop at verified **`OAuthUserProfile`**. Issue your app session with [**jwt-auth handoff**](./jwt-auth-handoff.md).

## Tests only

`createMemoryOAuthIdpDriver` — unit/e2e tests; never production default.
