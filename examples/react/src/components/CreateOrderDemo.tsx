import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createIdempotencyClientFetch } from "@eristack/idempotency/client";
import { useJwtAuth } from "@eristack/jwt-auth/react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const idempotentFetch = createIdempotencyClientFetch();

type CreateOrderDemoProps = {
  enabled: boolean;
};

/**
 * One Idempotency-Key per submit intent — stable across retries (double-click / network replay).
 */
export function CreateOrderDemo({ enabled }: CreateOrderDemoProps) {
  const { client: auth } = useJwtAuth();
  const queryClient = useQueryClient();
  const submitKeyRef = useRef<string | null>(null);
  const [customerId, setCustomerId] = useState("cust-acme");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate() {
    if (!enabled) return;
    setBusy(true);
    setMessage(null);
    const idempotencyKey = submitKeyRef.current ?? crypto.randomUUID();
    submitKeyRef.current = idempotencyKey;
    try {
      const token = await auth.ensureAccessToken();
      const res = await idempotentFetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId }),
        idempotencyKey,
      });
      const body = (await res.json()) as {
        orderId?: string;
        number?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        setMessage(body.error?.message ?? `Create failed (${res.status})`);
        return;
      }
      setMessage(`Created ${body.number ?? body.orderId}`);
      submitKeyRef.current = null;
      await queryClient.invalidateQueries({ queryKey: ["example", "orders"] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Create order (idempotent)</h2>
          <p className="lede">
            Sends <code>Idempotency-Key</code> via{" "}
            <code>@eristack/idempotency/client</code> — safe to retry until success.
          </p>
        </div>
      </div>
      <div className="form-row">
        <label>
          Customer id
          <input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={!enabled || busy}
          />
        </label>
        <button type="button" className="button-primary" disabled={!enabled || busy} onClick={() => void onCreate()}>
          {busy ? "Creating…" : "Create order"}
        </button>
      </div>
      {message ? <p className="hint">{message}</p> : null}
    </section>
  );
}
