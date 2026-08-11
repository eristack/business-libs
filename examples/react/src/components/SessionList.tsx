import type { AuthSessionResponse } from "@eristack/jwt-auth/client";

type SessionListProps = {
  sessions: AuthSessionResponse[];
  currentSessionId: string | null;
  busy: boolean;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onRevoke: (sessionId: string) => Promise<void>;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function SessionList({
  sessions,
  currentSessionId,
  busy,
  loading,
  onRefresh,
  onRevoke,
}: SessionListProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Active sessions</h2>
          <p className="lede">
            From <code>GET /auth/sessions</code>. Revoke calls{" "}
            <code>DELETE /auth/sessions/:id</code> (family kill).
          </p>
        </div>
        <button
          type="button"
          className="button-secondary"
          disabled={busy || loading}
          onClick={() => void onRefresh()}
        >
          {loading ? "Loading…" : "Refresh list"}
        </button>
      </div>

      {loading && sessions.length === 0 ? (
        <p className="lede">Loading sessions…</p>
      ) : null}

      {!loading && sessions.length === 0 ? (
        <p className="lede">No active refresh sessions for this subject.</p>
      ) : null}

      {sessions.length > 0 ? (
        <ul className="session-list">
          {sessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <li key={session.id}>
                <div className="session-meta">
                  <div className="session-title">
                    <code className="mono">{session.id}</code>
                    {isCurrent ? <span className="badge">This device</span> : null}
                  </div>
                  <p className="lede">
                    Family <code className="mono">{session.familyId.slice(0, 12)}…</code>
                    {" · "}
                    created {formatWhen(session.createdAt)}
                    {" · "}
                    expires {formatWhen(session.expiresAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="button-danger"
                  disabled={busy}
                  onClick={() => void onRevoke(session.id)}
                >
                  {isCurrent ? "Revoke & sign out" : "Revoke"}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
