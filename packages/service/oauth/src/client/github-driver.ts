import type { OAuthUserProfile } from "../core/types.js";
import { createOAuth2Driver } from "./oauth2-driver.js";

const GITHUB_AUTH = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_USER = "https://api.github.com/user";
const GITHUB_EMAILS = "https://api.github.com/user/emails";

export function createGitHubOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const fetchFn = options.fetch ?? fetch;

  return createOAuth2Driver({
    provider: "github",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: GITHUB_AUTH,
    tokenEndpoint: GITHUB_TOKEN,
    defaultScopes: options.defaultScopes ?? "read:user user:email",
    tokenRequestHeaders: { accept: "application/json" },
    fetch: fetchFn,
    async resolveProfile({ accessToken }) {
      const userRes = await fetchFn(GITHUB_USER, {
        headers: {
          authorization: `Bearer ${accessToken}`,
          accept: "application/vnd.github+json",
        },
      });
      const user = (await userRes.json()) as Record<string, unknown>;
      if (!userRes.ok) {
        throw new Error(typeof user.message === "string" ? user.message : "GitHub user fetch failed");
      }

      let email = typeof user.email === "string" ? user.email : undefined;
      let emailVerified: boolean | undefined;
      if (!email) {
        const emailsRes = await fetchFn(GITHUB_EMAILS, {
          headers: {
            authorization: `Bearer ${accessToken}`,
            accept: "application/vnd.github+json",
          },
        });
        if (emailsRes.ok) {
          const emails = (await emailsRes.json()) as Array<{
            email?: string;
            primary?: boolean;
            verified?: boolean;
          }>;
          const primary = emails.find((e) => e.primary) ?? emails[0];
          email = primary?.email;
          emailVerified = primary?.verified;
        }
      }

      const id = String(user.id ?? "");
      const profile: OAuthUserProfile = {
        provider: "github",
        subject: id,
        email,
        emailVerified,
        name: typeof user.name === "string" ? user.name : typeof user.login === "string" ? user.login : undefined,
        picture: typeof user.avatar_url === "string" ? user.avatar_url : undefined,
        raw: user,
      };
      return profile;
    },
  });
}
