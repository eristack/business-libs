---
"@eristack/design-system": patch
---

Expose `@eristack/design-system/tokens.css` in the package `exports` map so `@import` / bundler resolution works (previously only reachable via the unexported `src/tokens.css` path).
