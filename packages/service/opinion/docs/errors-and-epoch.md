# Errors & epoch

## Unified JSON errors

Use `@eristack/rest` / adapter `jsonError` envelopes — see `@eristack/ai-knowledge#http-errors`.

| Code | When |
| --- | --- |
| `NOT_FOUND` | Unknown `:id` |
| `POLICY_DENIED` / `BUSINESS_POLICY_DENIED` | PBAC transition denied |
| `CONFLICT_VERSION` | Optimistic lock failure on PUT/PATCH/DELETE |
| `STALE_EPOCH` | Client cache policy mismatch (optional strict mode) |

Transition handler example:

```ts
import { jsonError } from "@eristack/rest"; // or express helper

if (!row) {
  return { status: 404, body: jsonError("NOT_FOUND", "Invoice not found") };
}

try {
  await pbac.authorize(policyId, { action, document: row });
} catch {
  return { status: 409, body: jsonError("BUSINESS_POLICY_DENIED", "Transition not allowed") };
}
```

## Optimistic versioning

Include `version` in read responses. Require `If-Match` or body `version` on mutating requests. Bump version in same transaction as status change.

## Epoch cache policy

After successful transition or create:

```ts
import { createEpoch } from "@eristack/epoch";

await epoch.bump({ scope: "invoices" });
```

List/read handlers call `epoch.resolveCachePolicy` — TanStack Query client uses `@eristack/epoch/react` `useEpochCachePolicy`.

Stale list after transition usually means missing epoch bump, not wrong route map.

## Logging stale epoch (optional)

`@eristack/epoch` supports `withEpochStaleLogging` for debugging cache mismatches in development.

## 204 vs 200 on transition

- **`204 No Content`** — common for command-style PATCH
- **`200`** with updated row — when client needs fresh status without second GET

Pick one convention per app; document in OpenAPI.
