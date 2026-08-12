# @eristack/rbac

Role-based access control: **subjects → roles → permissions**, where every
permission answer is a boolean (allowed or not).

```ts
import { createRbac, createMemoryRbacStore } from "@eristack/rbac";

const rbac = createRbac({ store: createMemoryRbacStore() });

await rbac.definePermission({ name: "orders.create" });
await rbac.defineRole({
  name: "clerk",
  permissions: ["orders.create", "orders.read"],
});
await rbac.assignRole({ subject: userId, role: "clerk" });

await rbac.can(userId, "orders.create"); // true | false
await rbac.authorize(userId, "orders.create"); // throws ForbiddenError
```

App owns `users`. RBAC rows hang off `subject` (same pattern as jwt-auth).

See `docs/` for concepts, drizzle, Express/Nest/React adapters.
