---
title: Overview
description: Headless busy lock and confirm-run-success sequencing for ERP shells
---

# @eristack/feedback

Headless **busy counter** and **action sequence** helpers. The app paints the lock dialog, top progress bar, confirm modal, and toasts.

Pair HTTP error disposition with `@eristack/backseat/express` `createErrorCatalog` (see `@eristack/ai-knowledge#http-errors`).

| Subpath | Use |
| --- | --- |
| `@eristack/feedback` | `createBusy`, `runFeedbackSequence`, `createProgressObserver` |
| `@eristack/feedback/react` | `BusyProvider`, `useBusyState`, `useBusyHandle` |

Getting started: [getting-started](./getting-started.md).
