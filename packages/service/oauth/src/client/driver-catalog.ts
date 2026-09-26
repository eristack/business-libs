/** Preset driver keys — map 1:1 to `create*OAuthDriver` factories under `@eristack/oauth/client`. */
export const OAUTH_PRESET_PROVIDERS = [
  "google",
  "microsoft",
  "github",
  "apple",
  "facebook",
  "linkedin",
  "gitlab",
  "discord",
  "slack",
  "okta",
  "auth0",
  "keycloak",
  "amazon",
  "twitter",
  "cognito",
  "salesforce",
  "shopify",
] as const;

export type OAuthPresetProvider = (typeof OAUTH_PRESET_PROVIDERS)[number];

export type OAuthPresetProviderMeta = {
  id: OAuthPresetProvider;
  label: string;
  factory: string;
  defaultScopes: string;
  notes?: string;
};

/** Stable metadata for docs, UI pickers, and agent checklists — not runtime config. */
export const OAUTH_PRESET_PROVIDER_CATALOG: readonly OAuthPresetProviderMeta[] = [
  {
    id: "google",
    label: "Google",
    factory: "createGoogleOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "microsoft",
    label: "Microsoft / Entra ID",
    factory: "createMicrosoftOAuthDriver",
    defaultScopes: "openid profile email offline_access",
    notes: "tenantId: common | organizations | consumers | {guid}",
  },
  {
    id: "github",
    label: "GitHub",
    factory: "createGitHubOAuthDriver",
    defaultScopes: "read:user user:email",
  },
  {
    id: "apple",
    label: "Sign in with Apple",
    factory: "createAppleOAuthDriver",
    defaultScopes: "name email",
    notes: "Authorize uses response_mode=form_post — mount POST callback",
  },
  {
    id: "facebook",
    label: "Facebook / Meta",
    factory: "createFacebookOAuthDriver",
    defaultScopes: "email public_profile",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    factory: "createLinkedInOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "gitlab",
    label: "GitLab",
    factory: "createGitLabOAuthDriver",
    defaultScopes: "openid profile email",
    notes: "baseUrl for self-hosted",
  },
  {
    id: "discord",
    label: "Discord",
    factory: "createDiscordOAuthDriver",
    defaultScopes: "identify email",
  },
  {
    id: "slack",
    label: "Slack (OpenID)",
    factory: "createSlackOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "okta",
    label: "Okta",
    factory: "createOktaOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "auth0",
    label: "Auth0",
    factory: "createAuth0OAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "keycloak",
    label: "Keycloak",
    factory: "createKeycloakOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "amazon",
    label: "Login with Amazon",
    factory: "createAmazonOAuthDriver",
    defaultScopes: "profile",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    factory: "createTwitterOAuthDriver",
    defaultScopes: "users.read tweet.read offline.access",
  },
  {
    id: "cognito",
    label: "Amazon Cognito",
    factory: "createCognitoOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "salesforce",
    label: "Salesforce",
    factory: "createSalesforceOAuthDriver",
    defaultScopes: "openid profile email",
  },
  {
    id: "shopify",
    label: "Shopify Admin",
    factory: "createShopifyOAuthDriver",
    defaultScopes: "openid email",
    notes: "Partner app + shop subdomain",
  },
] as const;
