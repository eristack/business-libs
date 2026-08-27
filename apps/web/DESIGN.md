# Eristack web — design system

Canonical plan: `_ai-docs/docs-rebrand/overview.md`.

## Foundation (S0/S1)

### Typography

| Role | Face | Use |
| --- | --- | --- |
| **UI + body** | Plus Jakarta Sans | Nav, prose, labels, buttons |
| **Display** | Newsreader | Marketing/layer heroes only (`font-display`) |
| **Code** | JetBrains Mono | Code panels, inline code, badges |

Docs article titles stay **sans** (scanability). Heroes use **Newsreader**.

CSS utilities: `.font-display`, `.type-eyebrow`, `.type-lead`, `.prose-measure` (68ch).

### Color

Cool editorial paper (`#f5f4f1`), ink `#131316`, accent `#0d5568` (light) / `#5ebad4` (dark).

Source of truth: `src/lib/brand-tokens.ts` + `src/app/globals.css`.

### BrandMark

Isometric stack monogram + sans wordmark (+ optional “Business libraries” tagline on md marketing header).

### Chrome

- **Marketing:** full nav, `h-[4.25rem]`
- **Docs:** slim bar, `h-[3.25rem]`, Documentation + Libraries links

## Docs experience (S2)

- **Sidebar sections** — Start / Guides / Adapters / Reference, stored in each package `docs/_meta.json` (`sections` array)
- **Mobile drawer** — `DocsMobileNav` sheet on viewports `< md`
- **Body search** — markdown stripped into Cmd+K keywords (`doc-search-text.ts`)
- **TOC scroll-spy** — active heading in right rail (`DocsToc`)

### Docs catalog sync (non-stale nav)

Package docs are the source of truth (`packages/*/docs/*.md`). The site reads order + sidebar sections from `docs/_meta.json`.

| Command | When |
| --- | --- |
| `pnpm docs:sync` | After adding, removing, or reordering doc pages — updates `pages` + infers `sections` |
| `pnpm docs:check` | CI gate — every `.md` is listed in `_meta.json` and `sections` matches `pages` |

Scripts auto-discover packages with a `docs/` folder (`scripts/doc-packages.mjs`). Section labels follow slug rules in `scripts/doc-meta-lib.mjs` (mirrors former `doc-nav.ts` heuristics). Override a page’s section by reordering in `_meta.json` or editing `sections` after sync.

**Agent workflow:** add/edit markdown → run `pnpm docs:sync` → commit `_meta.json` with the doc change. CI fails if catalog is stale.

## Marketing unification (S4)

- **Library landings** — getting-started primary CTA, copyable install, `LibraryDocsCta`
- **EditorialProseShell** — shared article card for changelog + blog
- **Blog / start / philosophy** — PageHero + ContentSection bands

## Layer & package identity (S5)

- **LayerGlyph** — 7 layer SVG icons (`stack/layer-glyphs.tsx`)
- **Package motifs** — all 19 packages in `library-motif.tsx`
- **Docs chrome** — layer left rail on article cards; glyphs in matrix + badges

## Next (Phase 5+)

Agent skill strips, callouts, polish (S6–S7).
