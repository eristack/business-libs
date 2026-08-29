# RBAC permission naming

Stable **`resource:action`** strings keep RBAC, logs, and UI maps aligned.

## Pattern

```text
{resource}.{action}
```

| Good | Avoid |
| --- | --- |
| `orders.read` | `readOrders`, `ORDERS_READ` |
| `orders.create` | `create_order` |
| `goods-receipt.post` | `gr` (opaque) |
| `settings.formats.manage` | nested resource with dot segments |

Use **lowercase**, **dot-separated** segments, **verb last**. Match Express/Nest `@RequirePermission("…")` exactly.

## Resource vs action

- **Resource** — entity family the app owns (`orders`, `invoices`, `users`, `settings.formats`)
- **Action** — coarse verb (`read`, `create`, `update`, `delete`, `post`, `approve`, `manage`)

Document **software** gates (status, outstanding) belong in `@eristack/pbac`, not RBAC.

## Role bundles

Roles are named sets of permissions — not hierarchy in v0.1:

```ts
rbac.defineRole("warehouse-clerk", [
  "goods-receipt.read",
  "goods-receipt.post",
]);
```

Use `expandRolePermissions` when roles inherit from parents (app-defined graph).

## HTTP mapping

| Layer | Deny code |
| --- | --- |
| RBAC missing permission | **403** `FORBIDDEN_PERMISSION` |
| ABAC attribute deny | **409** `POLICY_DENIED` |
| PBAC document rule | **409** `BUSINESS_POLICY_DENIED` |

See [http-errors](./http-errors.md).

## Related

- `@eristack/rbac#rbac-adapters` — `createRequirePermission`
- `@eristack/rbac#rbac-core` — `definePermission`, `can`
