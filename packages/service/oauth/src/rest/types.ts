import type { OAuthConsumer } from "../core/types.js";
import type { OAuthProvider } from "../provider/create-oauth-provider.js";

export type RestRequest = {
  method: string;
  headers: { get(name: string): string | null };
  body: unknown;
  params: Record<string, string | undefined>;
  query: Record<string, string | string[] | undefined>;
};

export type RestResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

export type RestOAuthConsumerConfig = {
  consumer: OAuthConsumer;
};

export type RestOAuthProviderConfig = {
  provider: OAuthProvider;
};
