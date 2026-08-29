# Gotchas

## PUT vs PATCH

- **`PUT /:id`** — full document replace only; requires complete body and version
- **`PATCH /:id/:action`** — status/commands only
- Do not send `{ "status": "posted" }` on generic PATCH — use action route + PBAC

## Omitting handlers

Routes without handlers are **not registered**. Clients calling unimplemented roles get 404 from parent app — document rollout order in API changelog.

## Duplicate base paths

Two `createDocumentRoutes` with same `basePath` merge in one router — last handler wins per role. Use one routes array per resource.

## Money and qty in JSON

Never number literals for amounts. Use decimal strings; validate with `@eristack/money/zod` and `@eristack/uom/zod`.

## Transition without doc-transitions

You may use custom action names, but you lose preset consistency across apps. Prefer registering a forked graph with a new `id`.

## OpenAPI path ordering

Some codegen tools sort paths alphabetically — `:action` dynamic segment is normal; ensure action enum docs are in operation description.

## Backseat vs production

Backseat seeds can mirror opinion routes for demos. Production uses Express/Nest + Drizzle — same `basePath` and action names for easy graduation.
