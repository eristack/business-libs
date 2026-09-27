# Getting started

```bash
pnpm add @eristack/doc-shell @eristack/design-system react
```

```tsx
import { DocShell, DocHeader, DocActionBar } from "@eristack/doc-shell";

<DocShell
  header={<DocHeader title={docNumber} badges={<span>{status}</span>} />}
  actions={<DocActionBar trailing={<button>Post</button>} />}
>
  {form}
</DocShell>
```

Optional: compose with `@eristack/multitab` for tabbed document workspaces.
