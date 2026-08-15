# Bug: Core import crashes in Vite: promisify(scrypt) when crypto.scrypt is missing

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start fixing.

## Meta

- **id:** `20260814-065204-bug-core-import-crashes-in-vite-promisify-scrypt-whe-0d5d09`
- **kind:** bug
- **package:** `@eristack/jwt-auth`
- **observed version:** `0.3.0`
- **fixed in:** `0.3.1` (uses `@noble/hashes` instead of Node `crypto.scrypt` at import)
- **created:** 2026-08-14T06:52:04.629Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Importing @eristack/jwt-auth (createJwtAuth / createRestActions) in a Vite browser bundle throws TypeError: The original argument must be of type Function. password.ts calls util.promisify(scrypt) at module load; browser crypto polyfills (crypto-browserify) do not export scrypt, so the argument is undefined. The crash happens before any login call. Core is documented as pure/framework-free but hard-depends on Node crypto.scrypt with no engines/browser field and no ConfigurationError.

## Scenario

Frontend-first ERP prototype: mount jwt-auth REST actions on @eristack/backseat inside a Vite + React SPA so createJwtAuthClient can login without Express.

## Steps to reproduce

- In a Vite React app, import createJwtAuth and createRestActions from @eristack/jwt-auth (and /rest) from a module that runs in the browser.
- Optionally add vite-plugin-node-polyfills so Node crypto/util resolve (crypto-browserify).
- Load the app in Chrome. Observe the console before clicking Sign in.

## Expected

Either (a) core works in the browser using Web Crypto / isomorphic hashing, or (b) import fails with a jwt-auth ConfigurationError that says core requires Node crypto.scrypt, and docs/engines/browser field state Node-only. password hashing should not run until hashPassword/verifyPassword.

## Actual

Uncaught TypeError: The original argument must be of type Function at @eristack_jwt-auth.js (Vite optimized dep). Page JS dies on import. Error comes from util.promisify, not jwt-auth.

## Impact

High for frontend-first / Backseat prototypes: importing the core entry kills the entire SPA on load. Also a DX footgun because the stack trace names `util.promisify`, not jwt-auth.

## Environment

- runtime: Vite 6 browser bundle (Chrome)
- os: macOS darwin 25.6.0
- framework: React 19 + Vite + `@eristack/backseat` in-browser REST
- extra.package: `@eristack/jwt-auth@0.3.0`

## Logs

```text
Uncaught TypeError: The "original" argument must be of type Function
    at @eristack_jwt-auth.js?v=930bb5d3:4750

Observed in Chrome/Vite dev (apps/web) immediately on page load after importing
createJwtAuth / createRestActions from @eristack/jwt-auth into a browser bundle.

Verified in @eristack/jwt-auth@0.3.0 dist/index.js (src/core/password.ts):

  import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
  import { promisify } from "util";
  var scrypt = promisify(scryptCallback);

Vite + vite-plugin-node-polyfills maps `crypto` to crypto-browserify.
crypto-browserify does not implement `scrypt`, so scryptCallback is undefined.
Node util.promisify(undefined) throws exactly:

  TypeError: The "original" argument must be of type Function

The throw happens at module evaluation, before login() or hashPassword() run.
jose (JWT sign/verify) is already browser-safe; only this Node crypto import is not.
```

## Suspects

- `packages/service/jwt-auth/src/core/password.ts` — `promisify(scrypt)` at module scope
- `packages/service/jwt-auth/src/core/crypto.ts` — `createHash` / `randomBytes` from Node `crypto`
- `packages/service/jwt-auth/package.json` — no `engines`, no `browser` field
- `packages/service/jwt-auth/README.md` / `docs/index.md` — “pure core (no HTTP, no DB, no framework)” without Node-only caveat

## Fix plan

- Add a regression test that mocks crypto.scrypt as undefined and asserts import or createJwtAuth throws ConfigurationError (or succeeds with a browser hasher), not util.promisify TypeError.
- Stop calling promisify(scrypt) at module top level. Lazy-init inside hashPassword/verifyPassword and throw ConfigurationError if typeof scrypt !== function.
- Document that @eristack/jwt-auth core is Node-only until isomorphic crypto ships; set package.json engines and a browser field so Vite does not silently polyfill a broken crypto.
- Prefer isomorphic primitives: jose is already browser-safe; replace Node scrypt/randomBytes/createHash/timingSafeEqual with Web Crypto or @noble/hashes so Backseat prototypes can host createRestActions in-browser.
- If Node-only is the decision: keep password hashing in a Node-only subpath and make the core JWT issue/verify path importable without loading password.ts.

## Agent handoff

1. Load the package Intent skill(s) for `@eristack/jwt-auth`.
2. Reproduce from **Steps to reproduce** (or confirm cannot).
3. Implement along **Fix plan**; keep scope to this package.
4. Add/adjust tests; run package `test` + `typecheck`.
5. If public API changes, add a Changeset.

## Notes

Consumer context (Tiga Sekawan ERP): we mounted `createRestActions({ jwtAuth })` on Backseat so `/client` could login without Express. Documented happy path is still Node API + browser `/client`. That does not excuse the import-time `TypeError` from `util.promisify`.

Related: `@eristack/backseat` skill says “Auth → @eristack/jwt-auth” (do not fake auth in Backseat). Agents then import jwt-auth core into the Vite app and hit this crash.
