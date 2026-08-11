import type { AuthSessionResponse } from "@eristack/jwt-auth/client";
import type { MeResponse } from "../lib/me.js";
import { SessionList } from "./SessionList.js";

type DashboardProps = {
  me: MeResponse | null;
  status: string;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  sessions: AuthSessionResponse[];
  currentSessionId: string | null;
  busy: boolean;
  sessionsLoading: boolean;
  error: string | null;
  onRefreshToken: () => Promise<void>;
  onReloadProfile: () => Promise<void>;
  onReloadSessions: () => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onLogoutAll: () => Promise<void>;
};

export function Dashboard({
  me,
  status,
  accessToken,
  accessTokenExpiresAt,
  sessions,
  currentSessionId,
  busy,
  sessionsLoading,
  error,
  onRefreshToken,
  onReloadProfile,
  onReloadSessions,
  onRevokeSession,
  onLogout,
  onLogoutAll,
}: DashboardProps) {
  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Signed in</h2>
            <p className="lede">
              Profile from <code>GET /me</code>. Tokens live in app-injected storage.
            </p>
          </div>
          <div className="actions">
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void onReloadProfile()}
            >
              Reload profile
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void onRefreshToken()}
            >
              Refresh tokens
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={busy}
              onClick={() => void onLogout()}
            >
              Log out
            </button>
            <button
              type="button"
              className="button-danger"
              disabled={busy}
              onClick={() => void onLogoutAll()}
            >
              Log out everywhere
            </button>
          </div>
        </div>

        <dl className="meta">
          <div>
            <dt>status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>subject</dt>
            <dd>{me?.subject ?? "—"}</dd>
          </div>
          <div>
            <dt>claims</dt>
            <dd className="mono">
              {me?.claims ? JSON.stringify(me.claims) : "—"}
            </dd>
          </div>
          <div>
            <dt>access token</dt>
            <dd className="mono">
              {accessToken ? `${accessToken.slice(0, 28)}…` : "—"}
            </dd>
          </div>
          <div>
            <dt>expires</dt>
            <dd>
              {accessTokenExpiresAt
                ? new Date(accessTokenExpiresAt).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt>current session</dt>
            <dd className="mono">{currentSessionId ?? "—"}</dd>
          </div>
        </dl>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <SessionList
        sessions={sessions}
        currentSessionId={currentSessionId}
        busy={busy}
        loading={sessionsLoading}
        onRefresh={onReloadSessions}
        onRevoke={onRevokeSession}
      />
    </>
  );
}
