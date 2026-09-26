import type { OAuthUserProfile } from "../core/types.js";
import { createOAuth2Driver } from "./oauth2-driver.js";

const DISCORD_AUTH = "https://discord.com/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_USER = "https://discord.com/api/users/@me";

export function createDiscordOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const fetchFn = options.fetch ?? fetch;

  return createOAuth2Driver({
    provider: "discord",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: DISCORD_AUTH,
    tokenEndpoint: DISCORD_TOKEN,
    defaultScopes: options.defaultScopes ?? "identify email",
    fetch: fetchFn,
    async resolveProfile({ accessToken }) {
      const res = await fetchFn(DISCORD_USER, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(typeof json.message === "string" ? json.message : "Discord user fetch failed");
      }
      const avatar =
        typeof json.avatar === "string" && typeof json.id === "string"
          ? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png`
          : undefined;

      const profile: OAuthUserProfile = {
        provider: "discord",
        subject: String(json.id ?? ""),
        email: typeof json.email === "string" ? json.email : undefined,
        emailVerified: json.verified === true ? true : json.verified === false ? false : undefined,
        name: typeof json.global_name === "string" ? json.global_name : typeof json.username === "string" ? json.username : undefined,
        picture: avatar,
        raw: json,
      };
      return profile;
    },
  });
}
