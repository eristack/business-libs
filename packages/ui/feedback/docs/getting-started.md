---
title: Getting started
description: Wire busy lock and confirm-run-success in a React ERP shell without shipping one visual
---

# Getting started

## Install

```bash
pnpm add @eristack/feedback @eristack/feedback/react
```

## Busy lock (B1)

```tsx
import { BusyProvider, useBusyState, useBusyHandle } from "@eristack/feedback/react";
import { runFeedbackSequence } from "@eristack/feedback";

function AppShell({ children }) {
  return (
    <BusyProvider>
      <BusyLockOverlay />
      {children}
    </BusyProvider>
  );
}

function BusyLockOverlay() {
  const { isBusy, label } = useBusyState();
  if (!isBusy) return null;
  return <div role="dialog" aria-busy="true">{label ?? "Working…"}</div>;
}

function SaveButton() {
  const busy = useBusyHandle();
  return (
    <button
      type="button"
      onClick={() =>
        runFeedbackSequence({
          busy,
          label: "Saving invoice",
          confirm: () => window.confirm("Save now?"),
          work: () => api.patchInvoice(/* … */),
          onSuccess: () => toast.success("Saved"),
          onError: (err) => toast.error(catalog.resolveFromJsonBody(err)?.userMessage ?? "Failed"),
        })
      }
    >
      Save
    </button>
  );
}
```

`createBusy().run(work, label)` increments a counter cleared in `finally` — nested runs are safe.

Optional top-bar signal: `createProgressObserver()` and set `{ fetching, mutating, navigating }` from TanStack Query and the router; the app reads `observer.getState()` in its own component.

## Error catalog (B2 — server + client)

Register codes once; map throws in Express and classify JSON in the browser:

```ts
import { createErrorCatalog, createMapDomainError } from "@eristack/backseat/express";

export const appErrors = createErrorCatalog([
  {
    code: "INVOICE_NOT_DRAFT",
    httpStatus: 409,
    userMessage: "Only draft invoices can be edited",
    disposition: "toast",
    retry: false,
  },
]);

const mapDomainError = createMapDomainError({ catalog: appErrors });

// Client after fetch:
const body = await res.json();
const resolved = appErrors.resolveFromJsonBody(body);
if (resolved?.disposition === "not-found") navigate({ to: "/404" });
```

Built-in disposition defaults cover `NOT_FOUND`, `UNAUTHENTICATED`, `CONFLICT_VERSION`, `STALE_EPOCH`, and policy denies.

## Do not

- Ship a single mandatory dialog style — tokens and layout stay in the app.
- Retry `CONFLICT_VERSION` PATCHs without refetching — use disposition `refetch-document`.
