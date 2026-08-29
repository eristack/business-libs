# Concepts

## Opinion vs app ownership

| Layer | Owns |
| --- | --- |
| **@eristack/opinion** | Route paths, methods, role names, OpenAPI fragments |
| **Your app** | Drizzle schema, handlers, PBAC rules beyond transitions, UX |

opinion is **strict about shape, loose about implementation** — omit handlers you have not built; routes are not registered until you supply a handler.

## Document route roles

Each canonical path maps to a **role**:

| Role | HTTP | Purpose |
| --- | --- | --- |
| `options` | `GET /options` | Field metadata, enums, default sort |
| `list` | `GET /data-grid` | Paginated list envelope |
| `read` | `GET /:id` | Single row |
| `create` | `POST /` | New draft/default status |
| `replace` | `PUT /:id` | Full replace (versioned, rare) |
| `transition` | `PATCH /:id/:action` | Status/command transitions |
| `delete` | `DELETE /:id` | Soft-delete or cancel |

`createDocumentRoutes({ basePath, handlers })` only emits routes for roles present in `handlers`.

## Base path rules

- Pass resource prefix **without** trailing slash: `/invoices`, `/journal-entries`
- Mount adapter adds API prefix: `mountOpinionRouter({ router, basePath: "/api" })` → `/api/invoices/...`
- Tags flow to OpenAPI via `@eristack/opinion/openapi`

## Handler contract

Handlers are `@eristack/rest` `RestHandler` functions — return `{ status, body?, headers? }`. Use string-first JSON for money (`@eristack/money`), quantities (`@eristack/uom`), timestamps (`@eristack/timestamp`).

## Transitions and PBAC

`:action` names must match `@eristack/doc-transitions` graph actions. Authorize with `@eristack/pbac` before updating status. opinion does not call PBAC for you — keeps core free of policy side effects.

## Lists and epoch

List handler should use `@eristack/data-grid` parse/execute and return:

```json
{ "items": [], "pageInfo": {}, "query": {} }
```

Wire `@eristack/epoch` cache policy on read/list responses for TanStack Query — see [Errors & epoch](./errors-and-epoch.md).
