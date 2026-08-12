---
title: HTTP & UI adapters
description: REST, Express, Nest, the HTTP client, and headless React hooks
sidebar_position: 8
---

# HTTP & UI adapters

These adapters exist so a settings screen — "Finance can change the invoice pattern" — is an afternoon of work instead of a sprint. They are all **headless**: they shape JSON, call your `docNumber`, and stop there. No auth, no database, no UI kit, no `QueryClient`.

## What is (and is not) exposed

| Operation | Over HTTP | Why |
| --- | --- | --- |
| List / read / create / update formats | **Yes** | Configuration; low frequency, admin-owned |
| Preview a pattern | **Yes** | Pure rendering; no state touched |
| `next()` — allocate a number | **No** | Belongs in the transaction that creates the document |
| `peekNext()` — preview the next number | **No** | Reads a live counter; wire it into your own endpoint if a screen needs it |

> **This is a design decision, not an omission.** A number handed out over HTTP is a number the browser can lose, retry, or abandon — each outcome burning a value or, worse, tempting you to reuse one. Allocate on the server, in the same transaction as the insert. See [Sequencing](./sequencing.md#concurrency-and-gaps).
>
> If you *do* want a "next invoice will be…" hint in the UI, expose `peekNext` on your own route and label it as an estimate.

## Layering

```text
@eristack/doc-number                 core (createDocNumber)
        │
        ├── /rest                    framework-free actions over a RestRequest
        │     ├── /express           createDocNumberRouter
        │     └── /nest              DocNumberModule + DocNumberController
        └── /client                  fetch wrapper (framework-agnostic)
              └── /react             TanStack Query + Form option factory
```

`/react` talks only to `/client`. `/client` never guesses a base URL. `/rest` never touches a database.

## REST (framework-free)

```ts
import { createRestActions } from "@eristack/doc-number/rest";

const actions = createRestActions({ docNumber });

const response = await actions.listFormats({
  headers: { get: () => null },
  query: { entityKey: "invoice", page: "1", pageSize: "20" },
});
// { status: 200, body: { items, pageInfo, query } }
```

Every action takes a `RestRequest` (`{ method?, headers, body?, params?, query? }`) and resolves to `{ status, body }`. Nothing is thrown at you: domain errors are already mapped.

| Action | Method + path (defaults) | Success |
| --- | --- | --- |
| `listFormats` | `GET /formats?entityKey=…` + data-grid params | `200 { items, pageInfo, query }` |
| `getActiveFormat` | `GET /formats/active?entityKey=…` | `200 { format: FormatBody \| null }` |
| `getFormatById` | `GET /formats/:id` | `200 { format }` |
| `createFormat` | `POST /formats` | `201 { format }` |
| `updateFormat` | `PATCH /formats/:id` | `200 { format }` |
| `preview` | `POST /preview` | `200 { value }` |

Individual factories (`createListFormatsAction`, `createPreviewAction`, …) are exported if you want to mount a subset.

### Bodies

`FormatBody` is the wire shape of a `FormatRecord` — dates as ISO strings, `prefix` omitted entirely when unset:

```json
{
  "id": "fmt_01",
  "entityKey": "invoice",
  "pattern": "INV-{YYYY}{MM}-{SEQ:5}",
  "reset": "monthly",
  "prefix": "ACME/",
  "active": true,
  "createdAt": "2026-08-11T00:00:00.000Z",
  "updatedAt": "2026-08-11T00:00:00.000Z"
}
```

**`POST /formats`**

```json
{
  "entityKey": "invoice",
  "pattern": "INV-{YYYY}{MM}-{SEQ:5}",
  "reset": "monthly",
  "prefix": "ACME/",
  "active": true,
  "id": "optional-client-supplied-id"
}
```

`entityKey` and `pattern` are required. `reset` must be one of the four periods. Creating an active format deactivates its siblings.

**`PATCH /formats/:id`**

```json
{ "pattern": "INV-{YYYY}{MM}-{SEQ:6}", "prefix": null, "active": true }
```

Every field is optional. `"prefix": null` clears the prefix; omitting `prefix` leaves it untouched.

**`POST /preview`**

```json
{ "pattern": "INV-{YYYY}{MM}-{SEQ:5}", "sequence": 1, "at": "2026-08-11T00:00:00.000Z", "prefix": "ACME/" }
```

`pattern` and an integer `sequence` are required; `at` must be an ISO date string. The response is `{ "value": "ACME/INV-202608-00001" }`. This endpoint renders only — it never reads a counter.

### Errors

Errors come back as `{ error: { code, message } }`:

| Situation | Status | `code` |
| --- | --- | --- |
| Missing `entityKey` query param | `400` | `INVALID_QUERY` |
| Missing `:id` route param | `400` | `INVALID_PARAMS` |
| Missing / invalid body field | `400` | `INVALID_BODY` |
| Invalid pattern (`InvalidPatternError`) | `400` | `INVALID_PATTERN` |
| Parse mismatch (`ParseMismatchError`) | `400` | `PARSE_MISMATCH` |
| Unknown format id, or no active format | `404` | `FORMAT_NOT_FOUND` |
| Store / incrementer not configured | `500` | `MISSING_DEPENDENCY` |
| Anything else | `500` | `INTERNAL_ERROR` |

One sharp edge: data-grid validation errors (unknown field, unsupported operator) are not `DocNumberError`s, so they fall through to `500 INTERNAL_ERROR` with the underlying message rather than a `400`. The client entry parses against `formatDataGridSchema` before sending, which catches these in the browser; validate there, or map them yourself if you hand-roll the route.

## Express

```ts
import { createDocNumberRouter } from "@eristack/doc-number/express";

app.use("/doc-number", requireAdmin, createDocNumberRouter({ docNumber }));
```

Mounted paths, relative to wherever you mount the router:

| Method | Path | Action |
| --- | --- | --- |
| `GET` | `/formats` | list |
| `GET` | `/formats/active` | active format |
| `GET` | `/formats/:id` | by id |
| `POST` | `/formats` | create |
| `PATCH` | `/formats/:id` | update |
| `POST` | `/preview` | preview |

Override any of them:

```ts
createDocNumberRouter({
  docNumber,
  paths: { formats: "/number-formats", preview: "/number-preview" },
});
```

`applyRestResponse(res, restResponse)` and `toRestRequest(req, params?)` are exported so you can hand-roll a route that reuses the same mapping.

> **Auth is yours.** The router has no opinion about who may edit a numbering scheme. Put `requireAdmin` (or a tenant-scoping middleware) in front of it, exactly as in the example above. Nothing inside the package reads a token.

## NestJS

```ts
import { DocNumberModule } from "@eristack/doc-number/nest";

@Module({
  imports: [
    DocNumberModule.registerAsync({
      imports: [DatabaseModule],
      inject: [DRIZZLE],
      useFactory: (db: AppDb) => ({
        docNumber: createDocNumber({
          formats: createDrizzleFormatStore({ dialect: "pgsql", db, table: formatTable }),
          sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: sequenceTable }),
        }),
      }),
    }),
  ],
})
export class NumberingModule {}
```

Use `DocNumberModule.register({ docNumber })` when the app already built the instance synchronously.

The bundled `DocNumberController` serves the same six operations under `/doc-number/*`. Two exported tokens let you take control:

| Token | Provides |
| --- | --- |
| `DOC_NUMBER` | The `DocNumberApi` — inject it into your own services to call `next()` |
| `DOC_NUMBER_REST_CONFIG` | The `{ docNumber }` config, for building actions in a custom controller |

```ts
DocNumberModule.register({ docNumber, controller: false });
```

`controller: false` registers the providers without any routes — the right choice when you want guards, Swagger decorators, or different paths on your own controller:

```ts
@Controller("admin/numbering")
@UseGuards(AdminGuard)
export class NumberingController {
  constructor(@Inject(DOC_NUMBER) private readonly docNumber: DocNumberApi) {}
}
```

Guards are app-owned, same as Express middleware.

## HTTP client

```ts
import { createDocNumberClient } from "@eristack/doc-number/client";

const client = createDocNumberClient({
  baseUrl: () => appConfig.apiUrl,
  credentials: "same-origin",
  getHeaders: async () => {
    const token = await auth.ensureAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

| Option | Default | Notes |
| --- | --- | --- |
| `baseUrl` | — (required) | String or getter, resolved per call — multi-tenant hosts, late-loaded config |
| `formatsPath` | `/doc-number/formats` | Matches the Nest controller |
| `activeFormatPath` | `/doc-number/formats/active` | |
| `formatByIdPath` | `(id) => "/doc-number/formats/" + id` | Function, so you can nest ids under another prefix |
| `previewPath` | `/doc-number/preview` | |
| `fetch` | global `fetch` | Inject for tests or a custom transport |
| `credentials` | `"include"` | Static or getter |
| `getHeaders` | none | Merged into every request — auth, tenant id, tracing |

Methods mirror the REST surface and unwrap the envelopes:

```ts
await client.listFormats("invoice", { page: 1, pageSize: 20 }); // DataGridResult<FormatBody>
await client.getActiveFormat("invoice");                        // FormatBody | null
await client.getFormatById(id);                                 // FormatBody
await client.createFormat({ entityKey: "invoice", pattern: "INV-{YYYY}-{SEQ:5}" });
await client.updateFormat(id, { prefix: null });
await client.preview({ pattern: "INV-{YYYY}-{SEQ:5}", sequence: 1 });  // string
```

`listFormats` serialises the grid query with the same `formatDataGridSchema` the server validates against, then appends `entityKey` — so a client-side typo fails before the request leaves the browser.

Failures throw an `Error` carrying `code` and `status` from the response body, which is enough for a form to map `INVALID_PATTERN` onto the pattern field.

This entry is plain TypeScript. Vue, Svelte, or a CLI can use it directly; React is optional.

## React (headless)

Wrap the tree once. The provider takes either a ready client or a config:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { DocNumberProvider } from "@eristack/doc-number/react";

<QueryClientProvider client={queryClient}>
  <DocNumberProvider clientConfig={{ baseUrl: () => import.meta.env.VITE_API_URL }}>
    <App />
  </DocNumberProvider>
</QueryClientProvider>
```

> **The `QueryClientProvider` is yours.** The package never creates a `QueryClient`, so your retry policy, cache times, and devtools stay in one place. Hooks throw if used outside `DocNumberProvider`.

### `useDocNumberFormats`

One hook covers a settings screen: the list, the active format, and the mutations.

```tsx
const {
  formats,      // FormatBody[]
  pageInfo,     // PageInfo | null
  query,        // normalized DataGridQuery | null
  active,       // FormatBody | null
  status,       // "idle" | "loading" | "ready" | "error"
  error,        // string | null
  createFormat,
  updateFormat,
  preview,
  refresh,
  listQuery,    // raw TanStack Query results if you need them
  activeQuery,
  createMutation,
  updateMutation,
  previewMutation,
} = useDocNumberFormats("invoice", { page: 1, pageSize: 20 });
```

Mutations invalidate `["eristack", "doc-number", "formats", entityKey]` on success, so the table and the active-format badge refresh together. `createFormat` fills in `entityKey` from the hook argument unless you override it.

Query keys are exported for manual cache work:

```ts
import {
  docNumberFormatsQueryKey,
  docNumberActiveFormatQueryKey,
} from "@eristack/doc-number/react";

queryClient.invalidateQueries({ queryKey: docNumberFormatsQueryKey("invoice") });
```

`useDocNumberFormat(id)` is a plain `useQuery` for a single record — handy for an edit route loaded by id.

`useDocNumber()` returns the bound client methods with no caching, for imperative calls outside React Query.

### `createFormatFormOptions`

A TanStack Form **option factory** — defaults plus a submit handler, no fields and no markup:

```tsx
import { useForm } from "@tanstack/react-form";
import { createFormatFormOptions } from "@eristack/doc-number/react";

function InvoiceFormatForm() {
  const { createFormat, preview } = useDocNumberFormats("invoice");

  const form = useForm(
    createFormatFormOptions({
      entityKey: "invoice",
      defaultValues: { pattern: "INV-{YYYY}{MM}-{SEQ:5}", reset: "monthly" },
      onSubmit: async (value) => createFormat(value),
    }),
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="pattern">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={async () => {
              const sample = await preview({ pattern: field.state.value, sequence: 1 });
              setSample(sample); // your own state
            }}
          />
        )}
      </form.Field>
      <button type="submit">Save</button>
    </form>
  );
}
```

Defaults are `{ entityKey, pattern: "", reset: "never", active: true }`, overridable via `defaultValues`. You own every input, label, and validation message — the package deliberately ships no widgets. Wiring `preview` to the pattern field's blur is the cheapest way to show finance what they are about to save, and it surfaces `InvalidPatternError` before the record exists.

## Response contract

Success — list:

```json
{
  "items": [ /* FormatBody[] */ ],
  "pageInfo": {
    "mode": "offset",
    "page": 1,
    "pageSize": 50,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "query": { /* normalized DataGridQuery */ }
}
```

Success — single format: `{ "format": { … } }`. Preview: `{ "value": "INV-202608-00001" }`.

Error:

```json
{ "error": { "code": "INVALID_PATTERN", "message": "Pattern must include exactly one SEQ token" } }
```

The list envelope is identical to every other list in the stack — see [`@eristack/data-grid`](/docs/data-grid). Learn it once, reuse it everywhere.

## Next steps

- [Formats & listing](./formats-and-listing.md) — the schema behind `GET /formats`
- [Recipes](./recipes.md) — a full admin settings screen
- [API reference](./api-reference.md) — every export by entry point
