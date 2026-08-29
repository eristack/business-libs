# Route map

Canonical ERP document/master REST shape. All paths are suffixes after `basePath`.

## Full table

| Method | Path | Role | Summary |
| --- | --- | --- | --- |
| `GET` | `/options` | `options` | Field metadata, enums, default sort |
| `GET` | `/data-grid` | `list` | `{ items, pageInfo, query }` |
| `GET` | `/:id` | `read` | Single document or master row |
| `POST` | `/` | `create` | Create with draft/default status |
| `PUT` | `/:id` | `replace` | Full replace (version column required) |
| `PATCH` | `/:id/:action` | `transition` | Status transition or command |
| `DELETE` | `/:id` | `delete` | Soft-delete or cancel |

Constants: `DOCUMENT_ROUTE_SPECS` in core export.

## Parameter rules

### `:id`

- Opaque string primary key or business id from your schema
- Validate existence in handler; return `404` with unified JSON error envelope

### `:action`

- Lowercase command name from doc-transitions graph (`post`, `submit`, `approve`, `lock`, …)
- **Never** encode target status in the path — handler maps action → new status
- Do not overload `PUT` body with `{ action: "post" }` — use PATCH route only

## List query string

Align with `@eristack/data-grid` serialized search params (filters, sort, page). Client helpers: `@eristack/data-grid/client`.

## Options response (app-defined)

Typical JSON shape:

```json
{
  "fields": [
    { "key": "status", "type": "enum", "values": ["draft", "submitted", "published"] },
    { "key": "amount", "type": "money", "currency": "USD" }
  ],
  "defaultSort": [{ "field": "createdAt", "dir": "desc" }]
}
```

opinion does not validate options body — document contract in OpenAPI when you compose specs.

## Masters vs documents

Same route map for both. Masters may omit `transition` role or use a minimal graph (e.g. `lockGraph` only).

## Versioning

Use row `version` or `updatedAt` epoch on `PUT`/`PATCH`/`DELETE`. On mismatch return `409 CONFLICT_VERSION` — see [Errors & epoch](./errors-and-epoch.md).
