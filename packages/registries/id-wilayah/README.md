# @eristack/id-wilayah

Indonesia **official administrative division codes** (province → regency/city → district → village) and an English **government unit kind** taxonomy through hamlet, community block, and neighborhood for address forms.

- **Core** — normalize/parse 2/4/7/10-digit codes, registry API, sub-village local codes
- **`/bundled`** — Apr 2024 snapshot (~84k villages), Node gzip loader
- **`/zod`** — optional Zod 4 schemas

Bundled place **names** stay as published in the source dataset (often uppercase Indonesian); API identifiers and metadata labels are English.

Docs: [`docs/getting-started.md`](./docs/getting-started.md) when shipped.
