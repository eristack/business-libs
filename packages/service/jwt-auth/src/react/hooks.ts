import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { DataGridQueryInput } from "@eristack/data-grid";
import { createDataGrid, serializeQuery } from "@eristack/data-grid";
import { sessionDataGridSchema } from "../core/session-grid.js";
import type { AuthSessionResponse } from "../client/create-client.js";
import { useJwtAuthContext } from "./context.js";

export function useJwtAuth() {
  const { client, state } = useJwtAuthContext();
  return {
    client,
    status: state.status,
    accessToken: state.accessToken,
    accessTokenExpiresAt: state.accessTokenExpiresAt,
    issue: client.issue.bind(client),
    login: client.login.bind(client),
    changePassword: client.changePassword.bind(client),
    refresh: client.refresh.bind(client),
    logout: client.logout.bind(client),
    logoutAll: client.logoutAll.bind(client),
    listSessions: client.listSessions.bind(client),
    revokeSession: client.revokeSession.bind(client),
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

export function authSessionsQueryKey(queryInput?: DataGridQueryInput): QueryKey {
  const qs = serializeQuery(
    createDataGrid(sessionDataGridSchema).parse(queryInput),
  ).toString();
  return ["eristack", "jwt-auth", "sessions", qs];
}

/**
 * TanStack Query wrapper over `client.listSessions`.
 * Auth status/token stay on the client subscribe model — not Query cache.
 */
export function useAuthSessions(queryInput?: DataGridQueryInput) {
  const { client, state } = useJwtAuthContext();
  return useQuery({
    queryKey: authSessionsQueryKey(queryInput),
    queryFn: () => client.listSessions(queryInput),
    enabled: state.status === "authenticated",
  });
}

function useInvalidateSessions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["eristack", "jwt-auth", "sessions"],
    });
}

export function useLogin() {
  const { client } = useJwtAuthContext();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (input: {
      username: string;
      password: string;
      claims?: Record<string, unknown>;
    }) => client.login(input),
    onSuccess: () => invalidate(),
  });
}

export function useLogout() {
  const { client } = useJwtAuthContext();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: () => client.logout(),
    onSettled: () => invalidate(),
  });
}

export function useLogoutAll() {
  const { client } = useJwtAuthContext();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: () => client.logoutAll(),
    onSettled: () => invalidate(),
  });
}

export function useRevokeSession() {
  const { client } = useJwtAuthContext();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (sessionId: string) => client.revokeSession(sessionId),
    onSuccess: () => invalidate(),
  });
}

export function useChangePassword() {
  const { client } = useJwtAuthContext();
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      client.changePassword(input),
  });
}

/** Headless TanStack Form options for login — no UI widgets. */
export function createLoginFormOptions(options: {
  onSubmit: (value: {
    username: string;
    password: string;
  }) => Promise<unknown>;
}) {
  return {
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({
      value,
    }: {
      value: { username: string; password: string };
    }) => {
      await options.onSubmit(value);
    },
  };
}

/** Headless TanStack Form options for change-password. */
export function createChangePasswordFormOptions(options: {
  onSubmit: (value: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<unknown>;
}) {
  return {
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: async ({
      value,
    }: {
      value: { currentPassword: string; newPassword: string };
    }) => {
      await options.onSubmit(value);
    },
  };
}

export type { AuthSessionResponse };
