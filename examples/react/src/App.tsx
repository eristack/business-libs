import { useState } from "react";
import { useJwtAuth } from "@eristack/jwt-auth/react";

type MeResponse = {
  subject: string;
  claims?: Record<string, unknown>;
};

export function App() {
  const {
    status,
    accessToken,
    accessTokenExpiresAt,
    issue,
    refresh,
    logout,
    ensureAccessToken,
  } = useJwtAuth();
  const [subject, setSubject] = useState("user-1");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <header>
        <p className="eyebrow">@eristack/example-react</p>
        <h1>Headless JWT auth</h1>
        <p className="lede">
          Uses <code>JwtAuthProvider</code> / <code>useJwtAuth</code> against the
          Express example. No login UI ships in the library — this page is yours.
        </p>
      </header>

      <section className="panel">
        <h2>Session</h2>
        <dl className="meta">
          <div>
            <dt>status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>access token</dt>
            <dd className="mono">{accessToken ? `${accessToken.slice(0, 24)}…` : "—"}</dd>
          </div>
          <div>
            <dt>expires</dt>
            <dd>{accessTokenExpiresAt ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>Actions</h2>
        <label className="field">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            disabled={busy}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            disabled={busy || !subject}
            onClick={() =>
              run(async () => {
                setMe(null);
                await issue({ subject, claims: { role: "admin" } });
              })
            }
          >
            Issue tokens
          </button>
          <button
            type="button"
            disabled={busy || status !== "authenticated"}
            onClick={() => run(async () => { await refresh(); })}
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={busy || status !== "authenticated"}
            onClick={() =>
              run(async () => {
                const token = await ensureAccessToken();
                if (!token) {
                  throw new Error("No access token available");
                }
                const response = await fetch("/me", {
                  headers: { authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                  throw new Error(`GET /me failed (${response.status})`);
                }
                setMe((await response.json()) as MeResponse);
              })
            }
          >
            GET /me
          </button>
          <button
            type="button"
            disabled={busy || status !== "authenticated"}
            onClick={() =>
              run(async () => {
                setMe(null);
                await logout();
              })
            }
          >
            Logout
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {me ? (
          <pre className="result">{JSON.stringify(me, null, 2)}</pre>
        ) : null}
      </section>
    </main>
  );
}
