import { useForm } from "@tanstack/react-form";
import {
  createLoginFormOptions,
  useLogin,
} from "@eristack/jwt-auth/react";

type LoginFormProps = {
  error: string | null;
  onLoggedIn: (sessionId: string | null) => void;
};

/**
 * App-owned UI. Form options come from the library; inputs stay here.
 */
export function LoginForm({ error, onLoggedIn }: LoginFormProps) {
  const login = useLogin();

  const form = useForm({
    ...createLoginFormOptions({
      onSubmit: async (value) => {
        const pair = await login.mutateAsync(value);
        onLoggedIn(pair.sessionId ?? null);
      },
    }),
    defaultValues: {
      username: "demo",
      password: "password123",
    },
  });

  return (
    <section className="panel">
      <h2>Sign in</h2>
      <p className="lede">
        Credentials come from the Express seed user. This form is app UI —
        `@eristack/jwt-auth/react` only supplies headless Form options + Query
        mutations.
      </p>

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username">
          {(field) => (
            <label className="field">
              <span>Username</span>
              <input
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>

        {error || login.error ? (
          <p className="error" role="alert">
            {error ?? login.error?.message}
          </p>
        ) : null}

        <button type="submit" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
