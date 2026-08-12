# @eristack/abac

Attribute-based access control: **policies are algorithms** over subject /
resource / environment attributes that return **true or false**.

```ts
import { createAbac, attrs } from "@eristack/abac";

const abac = createAbac();

abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
});

await abac.evaluate("goods-receipt.book-value-limit", {
  subject: { id: userId, attrs: { maxBookValueMinor: 5_000_000 } },
  resource: { attrs: { bookValueMinor: bookMinor } },
  action: "create",
});
```

Use `@eristack/rbac` for boolean role permissions first; ABAC for attribute limits.
