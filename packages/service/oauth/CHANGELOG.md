# @eristack/oauth

## 0.1.1

### Patch Changes

- 99499e8: Remove `createMemoryOAuthPendingStore` from root export; use `@eristack/oauth/testing` in tests.

## 0.1.0

### Minor Changes

- ee12c4d: Initial alpha: OAuth2 consumer with 17+ preset IdP drivers (Google, Microsoft, GitHub, Apple, LinkedIn, Okta, Auth0, Keycloak, Slack, Discord, Cognito, Salesforce, …), generic OIDC/OAuth2 factories, PKCE, Drizzle pending logins, Express GET|POST callbacks; provider (client registry, auth code + PKCE token exchange).
