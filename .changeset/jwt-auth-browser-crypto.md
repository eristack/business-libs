---
"@eristack/jwt-auth": patch
---

Fix import-time crash in Vite browser bundles: replace Node-only `crypto.scrypt` / `util.promisify` with isomorphic Web Crypto + `@noble/hashes` scrypt so `createJwtAuth` and `createRestActions` load in Backseat prototypes.
