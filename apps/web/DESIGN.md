# Eristack web — design system

**Status:** S0–S7 complete (editorial enterprise rebrand, docs shell, agent chrome, polish).

Package markdown stays in `packages/*/docs` — the web app is a renderer. Rebrand scope is `apps/web` + brand assets.

## Brand pillars

1. **Enterprise-grade domain libraries** — money, ledgers, auth, numbering; not toy npm widgets.
2. **Agent-first** — docs for AI integrators and humans; scannable structure, strong wayfinding.
3. **Layered architecture** — primitive → capability → service → … is navigation and visual system.
4. **Sharp boundaries** — precise, not bloated; layer accents are **navigation chrome**, not wallpaper.

## Foundation (S0/S1)

### Typography

| Role | Face | Use |
| --- | --- | --- |
| **UI + body** | Plus Jakarta Sans | Nav, prose, labels, buttons |
| **Display** | Newsreader | Marketing/layer heroes only (`font-display`) |
| **Code** | JetBrains Mono | Code panels, inline code, badges |

Docs article titles stay **sans** (scanability). Heroes use **Newsreader**.

CSS utilities: `.font-display`, `.type-eyebrow`, `.type-lead`, `.prose-measure` (68ch).

Font weights are subset in `src/app/layout.tsx` (400–700 sans, 400–600 display, 400–500 mono).

### Color

Cool editorial paper (`#f5f4f1`), ink `#131316`, accent `#0d5568` (light) / `#5ebad4` (dark).

Source of truth: `src/lib/brand-tokens.ts` + `src/app/globals.css`. Layer accent hex must stay in sync — run `pnpm contrast:check`.

### BrandMark

Isometric stack monogram + sans wordmark (+ optional “Business libraries” tagline on md marketing header).

### Chrome

- **Marketing:** full nav, `h-[4.25rem]`
- **Docs:** slim bar, `h-[3.25rem]`, Documentation + Libraries links

## Docs experience (S2)

- **Sidebar sections** — Start / Guides / Adapters / Reference, stored in each package `docs/_meta.json` (`sections` array)
- **Mobile drawer** — `DocsMobileNav` sheet on viewports `< md`
- **Body search** — markdown stripped into Cmd+K keywords (`doc-search-text.ts`)
- **TOC scroll-spy** — active heading in right rail (`DocsToc`); mobile bottom sheet (`DocsTocMobile`, `< xl`)
- **Copyable code** — `prose-with-copy.tsx`, `copy-code-button.tsx`, `code-panel-shell.tsx`

### Docs catalog sync (non-stale nav)

Package docs are the source of truth (`packages/*/docs/*.md`). The site reads order + sidebar sections from `docs/_meta.json`.

| Command | When |
| --- | --- |
| `pnpm docs:sync` | After adding, removing, or reordering doc pages — updates `pages` + infers `sections` |
| `pnpm docs:check` | CI gate — every `.md` is listed in `_meta.json` and `sections` matches `pages` |
| `pnpm --filter @eristack/web contrast:check` | After changing layer accent colors — WCAG AA + `brand-tokens.ts` ↔ `globals.css` sync |

Scripts auto-discover packages with a `docs/` folder (`scripts/doc-packages.mjs`). Section labels follow slug rules in `scripts/doc-meta-lib.mjs`. Override a page’s section by reordering in `_meta.json` or editing `sections` after sync.

**Agent workflow:** add/edit markdown → run `pnpm docs:sync` → commit `_meta.json` with the doc change. CI fails if catalog is stale.

## Docs hub (S3)

- Layer matrix — compact cards per layer with package links + version
- Guided paths — New app, Upgrade, Money + QUPS, Auth + RBAC
- Cmd+K search hint and library count in hero
- Install snippet on every doc article

## Marketing unification (S4)

- **Library landings** — getting-started primary CTA, copyable install, `LibraryDocsCta`
- **EditorialProseShell** — shared article card for changelog + blog
- **Blog / start / philosophy** — PageHero + ContentSection bands

## Layer & package identity (S5)

- **LayerGlyph** — 7 layer SVG icons (`stack/layer-glyphs.tsx`)
- **Package motifs** — all 19 packages in `library-motif.tsx`
- **Docs chrome** — layer left rail on article cards; glyphs in matrix + badges
- **Rule:** package motifs inherit layer color — never full-bleed layer washes

## Agent-first docs chrome (S6)

- **DocsSkillStrip** — copyable Intent `load` command per doc page (`doc-agent-skills.ts` reads catalog; static map for `ai-knowledge`)
- **Callouts** — `> [!AGENT|NOTE|WARN|TIP]` via `rehypeDocsCallouts` + `.docs-callout--*` CSS
- **Docs hub routing** — `DocsHubRecommend` previews `recommend()` matches at build time
- **Sample content** — `[!AGENT]` on `money/getting-started`

## Polish (S7)

- **Print** — `.no-print` on header/footer/sidebar; article + code blocks print cleanly
- **Reduced motion** — global `@media (prefers-reduced-motion: reduce)`
- **Layer contrast** — `scripts/check-layer-contrast.mjs` (in CI)
- **Focus** — `:focus-visible` outline on interactive elements; prose link rings

## Deliberately unchanged

- Package markdown paths (`packages/*/docs`)
- Web rendering pipeline (`docs.ts` + remark) — evolve plugins, not MDX unless needed
- Category order (primitive → … → ai)
- GitHub source links per page

## Key file map

| Concern | Path |
| --- | --- |
| Tokens / prose CSS | `src/app/globals.css`, `src/lib/brand-tokens.ts` |
| Contrast gate | `scripts/check-layer-contrast.mjs` |
| Site config / packages | `src/lib/site.ts` |
| Docs data | `src/lib/docs.ts` |
| Markdown pipeline | `src/components/markdown.tsx`, `src/lib/rehype-docs-callouts.ts` |
| Docs article | `src/components/docs-article.tsx` |
| Docs sidebar / TOC | `src/components/docs-sidebar.tsx`, `docs-toc.tsx`, `docs-mobile-nav.tsx` |
| Global header | `src/components/site-header.tsx` |
| Search | `src/components/command-menu.tsx`, `src/lib/search-index.ts` |
| Layer accents | `src/lib/layer-theme.ts` |
| Agent skills | `src/lib/doc-agent-skills.ts`, `src/components/docs-skill-strip.tsx` |
| Recommend hub | `src/lib/docs-hub-recommend.ts`, `src/components/docs-hub-recommend.tsx` |
| Marketing heroes | `src/components/stack/page-hero.tsx`, `library-motif.tsx` |
