import { useCallback, useEffect, useState } from "react";
import type { AuthSessionResponse } from "@eristack/jwt-auth/client";
import { useJwtAuth } from "@eristack/jwt-auth/react";
import { Dashboard } from "./components/Dashboard.js";
import { LoginForm } from "./components/LoginForm.js";
import {
  getCurrentSessionId,
  setCurrentSessionId,
} from "./lib/current-session.js";
import { fetchMe, type MeResponse } from "./lib/me.js";

export function App() {
  const {
    client,
    status,
    accessToken,
    accessTokenExpiresAt,
  } = useJwtAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [sessions, setSessions] = useState<AuthSessionResponse[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(
    () => getCurrentSessionId(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  const rememberSession = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
    setCurrentSessionIdState(sessionId);
  }, []);

  const clearLocal = useCallback(() => {
    setMe(null);
    setSessions([]);
    rememberSession(null);
  }, [rememberSession]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    const token = await client.ensureAccessToken();
    if (!token) {
      setMe(null);
      return;
    }
    setMe(await fetchMe(token));
  }, [client]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      setSessions(await client.listSessions());
    } finally {
      setSessionsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (status === "unknown") return;

      if (status !== "authenticated") {
        if (!cancelled) {
          clearLocal();
          setBootstrapping(false);
        }
        return;
      }

      try {
        await loadProfile();
        await loadSessions();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [status, client, clearLocal, loadProfile, loadSessions]);

  async function handleLogin(input: { username: string; password: string }) {
    await run(async () => {
      const pair = await client.login({
        username: input.username,
        password: input.password,
      });
      rememberSession(pair.sessionId ?? null);
      await loadProfile();
      await loadSessions();
    });
  }

  async function handleRefreshToken() {
    await run(async () => {
      const pair = await client.refresh();
      if (pair.sessionId) rememberSession(pair.sessionId);
      await loadProfile();
      await loadSessions();
    });
  }

  async function handleLogout() {
    await run(async () => {
      await client.logout();
      clearLocal();
    });
  }

  async function handleLogoutAll() {
    await run(async () => {
      await client.logoutAll();
      clearLocal();
    });
  }

  async function handleRevokeSession(sessionId: string) {
    await run(async () => {
      await client.revokeSession(sessionId);

      if (sessionId === getCurrentSessionId()) {
        // Family already revoked; clear local tokens without requiring a live refresh token.
        try {
          await client.logout();
        } catch {
          /* server session already gone */
        }
        clearLocal();
        return;
      }

      await loadSessions();
    });
  }

  const showLogin =
    status === "anonymous" || (status === "unknown" && !bootstrapping);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">@eristack/example-react</p>
        <h1>JWT auth demo</h1>
        <p className="lede">
          Wired against the Express example: username/password login, profile,
          active sessions, revoke, logout, and logout-all. UI is app-owned; the
          library stays headless.
        </p>
      </header>

      {bootstrapping && status === "unknown" ? (
        <section className="panel">
          <p className="lede">Restoring session…</p>
        </section>
      ) : null}

      {showLogin ? (
        <LoginForm
          busy={busy}
          error={error}
          onLogin={async (input) => {
            try {
              await handleLogin(input);
            } catch {
              /* surfaced via error state */
            }
          }}
        />
      ) : null}

      {status === "authenticated" ? (
        <Dashboard
          me={me}
          status={status}
          accessToken={accessToken}
          accessTokenExpiresAt={accessTokenExpiresAt}
          sessions={sessions}
          currentSessionId={currentSessionId}
          busy={busy}
          sessionsLoading={sessionsLoading}
          error={error}
          onRefreshToken={async () => {
            try {
              await handleRefreshToken();
            } catch {
              /* surfaced via error state */
            }
          }}
          onReloadProfile={async () => {
            try {
              await run(loadProfile);
            } catch {
              /* surfaced via error state */
            }
          }}
          onReloadSessions={async () => {
            try {
              await run(loadSessions);
            } catch {
              /* surfaced via error state */
            }
          }}
          onRevokeSession={async (sessionId) => {
            try {
              await handleRevokeSession(sessionId);
            } catch {
              /* surfaced via error state */
            }
          }}
          onLogout={async () => {
            try {
              await handleLogout();
            } catch {
              /* surfaced via error state */
            }
          }}
          onLogoutAll={async () => {
            try {
              await handleLogoutAll();
            } catch {
              /* surfaced via error state */
            }
          }}
        />
      ) : null}
    </main>
  );
}
