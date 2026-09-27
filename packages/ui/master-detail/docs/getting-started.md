# Getting started

```bash
pnpm add @eristack/master-detail @eristack/list-shell react
```

```tsx
import { MasterDetailLayout } from "@eristack/master-detail";
import { ListPageLayout } from "@eristack/list-shell";

<MasterDetailLayout
  master={<ListPageLayout>{list}</ListPageLayout>}
  detail={selected ? <PartnerForm id={selected} /> : <p>Select a row</p>}
/>
```
