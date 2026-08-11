import { useState, type FormEvent } from "react";

type LoginFormProps = {
  busy: boolean;
  error: string | null;
  onLogin: (input: { username: string; password: string }) => Promise<void>;
};

export function LoginForm({ busy, error, onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("password123");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onLogin({
      username: username.trim(),
      password,
    });
  }

  return (
    <section className="panel auth-panel">
      <h2>Sign in</h2>
      <p className="lede">
        Demo credentials live in <code>jwt_auth_credentials</code> (child of
        app <code>users</code>). Login calls <code>POST /auth/login</code>.
      </p>

      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          Username
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={busy}
            required
          />
        </label>

        <label className="field">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            required
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button type="submit" disabled={busy || !username.trim() || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
