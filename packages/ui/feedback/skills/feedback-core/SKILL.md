---
name: feedback-core
description: >
  @eristack/feedback createBusy().run(work, label) nested counter; runFeedbackSequence confirm→busy→callbacks;
  createProgressObserver for fetch/mutate/navigate signals. React BusyProvider/useBusyState. App owns lock UI and toasts.
  Pair with @eristack/backseat/express createErrorCatalog for B2 disposition. Use for ERP shell busy lock (3ss B1/B5).
metadata:
  type: core
  library: "@eristack/feedback"
  library_version: "0.1.0"
sources:
  - packages/ui/feedback/docs/getting-started.md
---

# @eristack/feedback

```ts
import { createBusy, runFeedbackSequence } from "@eristack/feedback";
import { BusyProvider, useBusyState } from "@eristack/feedback/react";

const busy = createBusy();
await busy.run(() => api.save(), "Saving");

await runFeedbackSequence({
  busy,
  confirm: () => confirm("Delete?"),
  label: "Deleting",
  work: () => api.delete(),
  onSuccess: () => toast.success("Done"),
  onError: (err) => toast.error(String(err)),
});
```

Errors: `createErrorCatalog` from `@eristack/backseat/express` — `#http-errors`.
