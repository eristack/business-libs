# @eristack/entity-id

UUID **v7** primary keys for ERP tables — time-sortable, strict parse, optional Drizzle default.

```ts
import { generateEntityId, parseEntityId } from "@eristack/entity-id";

const id = generateEntityId();
parseEntityId(id);
```

Docs: [getting started](./docs/getting-started.md).
