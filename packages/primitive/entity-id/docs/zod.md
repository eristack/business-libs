# Zod

Peer: `zod` ^4.

```ts
import { entityIdSchema } from "@eristack/entity-id/zod";

entityIdSchema.parse("018bcfe5-687b-7bcd-af01-234567890123");
```

Output type is branded `EntityId` from core. Invalid version or variant fails with a custom issue message from `EntityIdParseError`.
