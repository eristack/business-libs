---
"@eristack/data-grid": patch
"@eristack/jwt-auth": patch
"@eristack/doc-number": patch
---

React adapters now wrap `/client` with TanStack Query (lists/mutations) and optional TanStack Form option helpers. `/client` stays framework-agnostic (base for future Vue/Svelte). Apps own `QueryClientProvider`.
