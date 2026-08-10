import { useJwtAuthContext } from "./context.js";

export function useJwtAuth() {
  const { client, state } = useJwtAuthContext();
  return {
    client,
    status: state.status,
    accessToken: state.accessToken,
    accessTokenExpiresAt: state.accessTokenExpiresAt,
    issue: client.issue.bind(client),
    refresh: client.refresh.bind(client),
    logout: client.logout.bind(client),
    logoutAll: client.logoutAll.bind(client),
    acceptTokenPair: client.acceptTokenPair.bind(client),
    ensureAccessToken: client.ensureAccessToken.bind(client),
  };
}

export function useAccessToken(): string | null {
  return useJwtAuthContext().state.accessToken;
}

export function useAuthStatus() {
  return useJwtAuthContext().state.status;
}
