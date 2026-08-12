import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useAuthSessions,
  useJwtAuth,
  useLogout,
  useLogoutAll,
  useRevokeSession,
} from "@eristack/jwt-auth/react";
import { Dashboard } from "./components/Dashboard.js";
import { LoginForm } from "./components/LoginForm.js";
import {
  getCurrentSessionId,
  setCurrentSessionId,
} from "./lib/current-session.js";
import { fetchMe, type MeResponse } from "./lib/me.js";

export function App() {
  const { client, status, accessToken, accessTokenExpiresAt } = useJwtAuth();
  const sessionsQuery = useAuthSessions();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const revokeSession = useRevokeSession();

  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(
    () => getCurrentSessionId(),
  );
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const rememberSession = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
    setCurrentSessionIdState(sessionId);
  }, []);

  const meQuery = useQuery({
    queryKey: ["example", "me", status],
    queryFn: async (): Promise<MeResponse | null> => {
      const token = await client.ensureAccessToken();
      if (!token) return null;
      return fetchMe(token);
    },
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unknown") return;
    setBootstrapping(false);
    if (status !== "authenticated") {
      rememberSession(null);
    }
  }, [status, rememberSession]);

  const busy =
    logout.isPending ||
    logoutAll.isPending ||
    revokeSession.isPending ||
    meQuery.isFetching ||
    sessionsQuery.isFetching;

  async function handleRefreshToken() {
    setError(null);
    try {
      const pair = await client.refresh();
      if (pair.sessionId) rememberSession(pair.sessionId);
      await Promise.all([meQuery.refetch(), sessionsQuery.refetch()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setError(null);
    try {
      await revokeSession.mutateAsync(sessionId);
      if (sessionId === getCurrentSessionId()) {
        try {
          await logout.mutateAsync();
        } catch {
          /* server session already gone */
        }
        rememberSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const showLogin =
    status === "anonymous" || (status === "unknown" && !bootstrapping);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">@eristack/example-react</p>
        <h1>JWT auth + data-grid demo</h1>
        <p className="lede">
          Client owns HTTP; React uses TanStack Query/Form helpers from
          `@eristack/jwt-auth/react` and list hooks from
          `@eristack/data-grid/react`. UI stays app-owned.
        </p>
      </header>

      {bootstrapping && status === "unknown" ? (
        <section className="panel">
          <p className="lede">Restoring session…</p>
        </section>
      ) : null}

      {showLogin ? (
        <LoginForm
          error={error}
          onLoggedIn={(sessionId) => {
            rememberSession(sessionId);
            setError(null);
          }}
        />
      ) : null}

      {status === "authenticated" ? (
        <Dashboard
          me={meQuery.data ?? null}
          status={status}
          accessToken={accessToken}
          accessTokenExpiresAt={accessTokenExpiresAt}
          sessions={sessionsQuery.data?.items ?? []}
          currentSessionId={currentSessionId}
          busy={busy}
          sessionsLoading={sessionsQuery.isPending}
          error={
            error ??
            meQuery.error?.message ??
            sessionsQuery.error?.message ??
            null
          }
          onRefreshToken={async () => {
            await handleRefreshToken();
          }}
          onReloadProfile={async () => {
            await meQuery.refetch();
          }}
          onReloadSessions={async () => {
            await sessionsQuery.refetch();
          }}
          onRevokeSession={async (sessionId) => {
            await handleRevokeSession(sessionId);
          }}
          onLogout={async () => {
            setError(null);
            await logout.mutateAsync();
            rememberSession(null);
          }}
          onLogoutAll={async () => {
            setError(null);
            await logoutAll.mutateAsync();
            rememberSession(null);
          }}
        />
      ) : null}
    </main>
  );
}
