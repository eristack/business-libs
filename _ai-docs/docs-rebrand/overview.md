# Eristack Docs — Total Restyle Plan

> **Status:** **S5 in progress** — full package motifs + layer glyphs; Phase 5 agent chrome next  
> **Scope:** `apps/web` + brand assets. Package markdown in `packages/*/docs` stays source of truth.

## Decisions log

| # | Topic | Decision |
| --- | --- | --- |
| 0.1 | Visual direction | **Editorial Enterprise (B) primary** — professional, light-forward, strong typography and whitespace. Borrow from **A** (mono/code discipline, subtle ledger grid in heroes/code panels only) and **C** (layer accents for navigation/badges, not full-page color). |
| 0.2 | Docs header | **Slim docs bar** on `/docs/*` — logo, package switcher, search, theme; minimal links (Libraries · GitHub). Full marketing nav stays on `/`, `/packages`, `/story`, etc. |
| 0.3 | Visual identity | **Both layers and packages** — each of the 7 layers gets a distinct layer visual system (glyph, pattern, chrome); **each publishable package** gets its own unique, rich motif/hero (extend `library-motif.tsx` + hero demos to full catalog). Layer frames package; package adds character within layer. |
| 0.4 | Agent skill-load strips | **Deferred** — decide during S6 (Phase 5); prototype optional on getting-started only if it helps evaluation. |
| 0.5 | Search | **Build-time body index** first — extend `search-index.ts` with markdown body text; Pagefind later only if needed. |
| 0.6 | Logo | **Generate v1 in repo** — SVG wordmark/icon for S1; replaceable when real brand assets exist. |
| 0.7 | Display typography | **Deferred** — target: **professional + modern + slightly different** (not generic Inter/shadcn). Compare 2–3 candidates in S0 (e.g. serif editorial vs distinctive sans); body stays clean sans; display only on heroes/landings. |

## Vision

Turn eristack.dev from **“default shadcn dev docs”** into a **recognizable enterprise library brand**: serious ERP/domain credibility, agent-first clarity, layer-aware navigation, and one visual system across marketing + docs + changelogs + blog.

**Constraint (keep):** package markdown stays in `packages/*/docs` — the web app remains a renderer. Rebrand is almost entirely `apps/web` + brand assets, not 19× package doc rewrites.

---

## Current state (honest audit)

| Area             | Today                                                   | Brand problem                             |
| ---------------- | ------------------------------------------------------- | ----------------------------------------- |
| Identity         | Text “E” square, no logo/OG set                         | Forgettable, not enterprise               |
| Palette          | shadcn neutral zinc + generic blue `#2563eb`            | Looks like every Tailwind docs site       |
| Typography       | Inter + JetBrains Mono                                  | Fine, not distinctive                     |
| Docs shell       | Gray rail + white card under **full marketing header**  | Marketing and docs feel like two products |
| Prose            | ~180 lines hand-rolled `.prose-docs` in `globals.css`   | Hard to evolve consistently               |
| Layer colors     | 7 hex values duplicated in CSS + `layer-theme.ts`       | Drift risk, no single brand source        |
| Code             | Bright (heroes) + rehype-pretty-code (docs)             | Two pipelines to theme                    |
| Mobile docs      | Sidebar stacks above content                            | Poor reading UX                           |
| Search           | Cmd+K title/keyword index only                          | Weak for 100+ doc pages                   |
| Package identity | `library-motif.tsx` for ~14 packages, fallback for rest | Uneven library landings                   |

**Key files today:** `globals.css`, `site.ts`, `docs-article.tsx`, `docs-sidebar.tsx`, `markdown.tsx`, `site-header.tsx`, `page-hero.tsx`, `command-menu.tsx`.

---

## Brand pillars (what the restyle should communicate)

1. **Enterprise-grade domain libraries** — money, ledgers, auth, numbering; not toy npm widgets.
2. **Agent-first** — docs are for AI integrators as much as humans; scannable structure, strong wayfinding.
3. **Layered architecture** — primitive → capability → service → … is a **navigation and visual** system, not just folder order.
4. **Sharp boundaries** — libraries do one job; the site should feel precise, not bloated.

---

## Phase 0 — Brand foundation (decisions before code)

**Deliverables:** brand brief doc + Figma (or equivalent) token sheet.

### 0.1 Visual direction — **decided**

**Primary: Editorial Enterprise (B)** — the site should read **professional** first: credible for ERP buyers and library consumers, not flashy or “startup gradient.”

| Pillar | From | How it shows up |
| --- | --- | --- |
| **Editorial (lead)** | B | Light-forward surfaces, generous margins, clear type hierarchy, restrained color, wide readable measure for docs prose |
| **Ledger discipline** | A | Monospace for code/install/commands; optional subtle grid/ledger line in **heroes and code panels only** — not a dark theme default |
| **Layer wayfinding** | C | Seven layer accents stay for badges, sidebar active state, package switcher grouping — accents are **navigation chrome**, not wallpaper |

**Avoid:**

- Full dark-default docs (too “terminal”; hurts long reading)
- Neon layer backgrounds or rainbow marketing heroes
- Generic shadcn zinc + blue (current problem)

**Mood board anchors:** Stripe docs seriousness, Linear’s clarity, Vercel/Geist cleanliness — **without** copying their palette wholesale.

**Rejected as sole direction:** A-only (too cold/dark for primary docs reading), C-only (too colorful for “professional enterprise libraries”).

### 0.1a Editorial direction — concrete rules (for S0 token sheet)

1. **Surfaces:** warm-neutral or cool-neutral paper (`surface-0` page, `surface-1` docs rail, `surface-2` article card) — not pure `#fafafa` zinc clone.
2. **Ink hierarchy:** one near-black for headings, one body gray, one muted for meta — no more than three text grays in prose.
3. **Accent:** single brand accent (deep blue or ink-adjacent) for links and focus; layer colors **never** replace brand accent for body links.
4. **Display type:** serif or sharp geometric sans for **page titles and marketing heroes only**; docs article titles can stay sans for scanability.
5. **Density:** marketing can breathe; docs sidebar stays compact; article line-height ≥ 1.65 for body.
6. **Code:** editorial body + mono code blocks (A borrow) — code is the one place that feels “technical ledger.”

### 0.2 Docs chrome — **decided**

**Slim docs top bar** on all `/docs/*` routes: brand mark, package switcher, search (Cmd+K), theme toggle, minimal links (Libraries · GitHub). Full marketing `SiteHeader` on `/`, `/packages`, `/story`, etc. See Phase 2.1.

### 0.3 Logo & asset system — **decided: generate v1**

- **S1:** SVG wordmark + icon in repo (`apps/web/public/brand/` or inline component) — stack/layer metaphor, editorial-appropriate
- Favicon set derived from icon (16/32/180/512)
- OG image template (package name, layer, version)
- Optional: npm badge / “Published @eristack/*” strip for docs headers
- **Replace later** when official brand assets exist — component API stays stable

### 0.4 Typography system (aligned to editorial) — **display deferred (0.7)**

Replace generic Inter everywhere. **Display face:** pick in S0 from 2–3 candidates that feel **professional, modern, and slightly different** (not stock dev-docs). Examples to compare:

| Candidate | Flavor |
| --- | --- |
| **Instrument Sans** / **Geist Sans** | Modern product, clean |
| **Source Serif 4** (display only) | Editorial, published-guide |
| **IBM Plex Sans** (display weight) | Enterprise-modern, subtle distinction |

| Role | Use | Direction |
| --- | --- | --- |
| **Display** | Marketing heroes, layer landings, `/docs` hub | **TBD in S0** — one distinctive face for headlines only |
| **Body** | Docs prose, marketing copy, nav | Clean sans (Source Sans 3, Geist Sans, or IBM Plex Sans) |
| **Mono** | Code, install lines, Intent commands | IBM Plex Mono or JetBrains — ledger discipline |

**Rule:** display face never used for long docs paragraphs — editorial hierarchy, not novelty.

### 0.5 Color tokens (single source of truth)

Create `src/lib/brand-tokens.ts` (or CSS `@theme` only) exporting:

- **Brand:** ink (near-black), accent (single professional link/focus color), surface-0/1/2 (editorial paper stack)
- **Semantic:** success/warn/info (muted, not loud — editorial callouts)
- **Docs:** rail (surface-1), article (surface-2 or white), code-bg (slightly tinted, not pure black)
- **Layer (×7):** accent, soft, rail — **navigation only** (badges, active nav, package switcher groups); never full-bleed hero fills

Retire ad-hoc hex in `globals.css` + `layer-theme.ts` duplication.

---

## Phase 1 — Design system overhaul (`apps/web`)

**Goal:** one token layer drives marketing + docs + blog + changelog.

### 1.1 Token migration

- Restructure `globals.css`: brand → semantic → component tokens
- Map all shadcn variables to brand (not stock neutral)
- Dark mode as first-class (not inverted zinc)
- Radius/spacing scale: slightly larger radii for “product” feel (docs cards, code blocks)

### 1.2 Component primitives (new or refactor)

| Primitive     | Purpose                                                                |
| ------------- | ---------------------------------------------------------------------- |
| `BrandMark`   | Logo/wordmark; replaces “E” square in header/footer                    |
| `DocsShell`   | Dedicated docs layout wrapper (see Phase 2)                            |
| `Prose`       | Replace `.prose-docs` with token-driven typography component           |
| `CodeBlock`   | Unified wrapper over Shiki output (merge Bright + pretty-code styling) |
| `Callout`     | Note/warn/tip/agent-hint blocks (rehype plugin or shortcodes)          |
| `LayerChrome` | Unified layer stripe used on landings **and** docs breadcrumbs         |

### 1.3 shadcn refresh

- Re-run shadcn with new CSS variables
- Button variants: primary = brand, secondary = layer-soft, ghost for nav
- Sheet/Command dialog restyled to match docs chrome

**Exit criteria:** `/` and `/docs/money/getting-started` look like the same product; Storybook or a `/design-system` internal page documents tokens (optional but useful for big overhauls).

---

## Phase 2 — Docs experience overhaul (biggest UX win)

**Goal:** best-in-class library docs for agents and humans.

### 2.1 Dedicated docs shell

Today: global `SiteHeader` + docs sidebar. **Proposed (0.2 — slim bar):**

```
┌─────────────────────────────────────────────────────────┐
│ DocsTopBar: Brand | PackageSwitcher | Search | Theme    │
├──────────┬──────────────────────────────┬───────────────┤
│ Sidebar  │ Article (Prose)              │ TOC (xl+)     │
│ (tree)   │ + page meta + GitHub + ver   │ scroll-spy    │
│          │ + Agent hint strip (optional)│               │
├──────────┴──────────────────────────────┴───────────────┤
│ DocsFooter: prev/next | edit on GitHub | npm install    │
└─────────────────────────────────────────────────────────┘
```

- Slimmer top bar on `/docs/*` (marketing nav collapses to “Libraries · Story · GitHub”)
- Full marketing header stays on `/`, `/packages`, `/story`, etc.

**Files:** new `docs-layout.tsx`, refactor `docs/[package]/layout.tsx`, `site-header.tsx` (variant prop).

### 2.2 Sidebar redesign — **S2 shipped + catalog sync**

- **Tree navigation** with section groups from `_meta.json` `sections` array (Start / Guides / Adapters / Reference)
- **`pnpm docs:sync`** — after add/remove/reorder `.md` files, regenerates `pages` + `sections` in every package `docs/_meta.json` (auto-discovers packages with `docs/`)
- **`pnpm docs:check`** — CI gate; fails if a markdown file is missing from `_meta.json` or `sections` drift from `pages`
- Site reads sections via `listDocNavSections()` — no runtime slug heuristics in `doc-nav.ts`
- Package switcher: layer-grouped, with version + status badge
- **Mobile:** slide-over Sheet with current page tree + package switch
- Active page: layer-accent left rail indicator

### 2.3 Article header redesign

Current: breadcrumbs + version badge. **Add:**

- Install snippet (`pnpm add @eristack/money`) — copy button
- “Load skill” Intent command when page maps to a skill (tie to catalog)
- Last updated / source link (keep GitHub)
- Optional: “On this page” jump on mobile

### 2.4 Prose & content blocks

Replace hand-rolled `.prose-docs` with:

- Typography plugin **or** structured `Prose` component with design tokens
- **Callouts:** `> [!AGENT]`, `> [!NOTE]`, `> [!WARN]` via remark (agents scan these)
- **Diagrams:** consistent `docs-diagram` styling + optional Mermaid later
- **Tables:** sticky header, zebra, better mobile scroll
- **API tables:** optional custom markdown convention for params/types

### 2.5 TOC upgrade

- Scroll-spy active heading
- Mobile TOC drawer
- Share slug algorithm with `rehype-slug` (fix drift)

### 2.6 Search overhaul — **decided: body index (0.5)**

- **Ship:** extend `search-index.ts` to index markdown **body text** at build time (titles + description + content keywords)
- **Later (optional):** Pagefind if ranking/snippets prove insufficient

Cmd+K groups: Packages · Doc pages · Blog · Roadmap · Commands (`load @eristack/...`)

---

## Phase 3 — Marketing ↔ docs unification

**Goal:** one brand journey from landing → library → docs.

### 3.1 Library landings (`/[slug]`)

- Hero: layer motif + **live mini-demo** (already started) — standardize grid
- “Start here” path: Getting started → Adapters → Core skill load command
- Docs CTA uses new visual language

### 3.1 Library landings (`/[slug]`) — **S4 shipped**

- Primary CTA → **Getting started** doc page
- Copyable install snippet in hero (same as docs articles)
- `LibraryDocsCta` — documentation path band (getting started → docs → agent skill)

### 3.2 Docs hub (`/docs`) — **S3 shipped**

- Layer matrix — compact cards per layer with package links + version
- Featured paths: New app, Upgrade, Money + QUPS, Auth + RBAC
- Hero with Cmd+K search hint and library count
- Article pages: copyable `pnpm add @eristack/…` install snippet (2.3 partial)

### 3.3 Changelog & blog — **S4 shipped**

- Changelog prose in `EditorialProseShell` (matches docs article card)
- Blog index + posts use `PageHero` + editorial shell

### 3.4 `/start` and `/philosophy` — **S4 shipped**

- `/start` — PageHero + step bands with CodePanel
- `/philosophy` — design targets grid + product tenets, aligned with agent-workflow

---

## Phase 4 — Layer & package visual identity

**Goal:** every `@eristack/*` package feels intentional.

### 4.1 Layer system as brand — **S5 shipped**

- `LayerGlyph` SVG icons for all 7 layers (badges, strip, docs matrix)
- `LayerStrip` on `/docs` hub hero footer
- Docs article card: layer-accent left rail via `data-layer`

### 4.2 Package motifs — **S5 shipped (full catalog)**

All 19 publishable packages have hero motifs in `library-motif.tsx` (added: timestamp, stock-movement, financial-ledger, valuations, hash-chained-ledger). `motifForPackage()` maps every package slug — no fallback-only landings.

**Rules:**

- Package motif **inherits** layer color system — never fights it
- Missing packages today get motifs in Phase 4 before ship (no fallback gray tiles in production)
- Rich ≠ noisy: editorial base keeps motifs in hero/demo zones, not full-page washes
- Reuse `package-demos/*` pattern where a live demo exists; CSS/SVG motif where not

**Execution note:** Phase 4 is larger than “7 abstracts only” — budget extra time in S5 for packages not yet covered.

### 4.3 Version & status language

- Unified `VersionBadge` / `StatusBadge` / “Alpha” treatment
- npm version synced from `package.json` at build (already partially there)

---

## Phase 5 — Agent-first docs chrome (on-brand for Eristack)

Unique differentiator vs other doc sites:

| Feature               | Implementation                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Skill load strip**  | DocsArticle reads package → primary skill from catalog → copyable `pnpm dlx @tanstack/intent@latest load …` |
| **Agent callouts**    | remark transform for `> [!AGENT]`                                                                           |
| **Recommend hint**    | On docs hub: “Ask: invoices + login” → shows recipe match preview                                           |
| **Copy-first blocks** | Install, import, minimal example always in styled copy blocks                                               |

Data source: `@eristack/ai-knowledge` catalog at build time (already in monorepo).

---

## Phase 6 — Performance, a11y, polish

- Font subsetting + `display: swap`
- Reduced motion respect
- Focus rings on brand accent
- Contrast audit (WCAG AA) on layer colors
- Print stylesheet for docs
- Lighthouse budget: LCP < 2.5s on doc pages

---

## Execution roadmap (suggested order)

| Sprint             | Scope                                      | Outcome                         |
| ------------------ | ------------------------------------------ | ------------------------------- |
| **S0** (1 week)    | Brand decisions, logo, tokens in Figma     | Signed-off direction            |
| **S1** (1–2 weeks) | Phase 1 tokens + BrandMark + header/footer | Site looks different everywhere |
| **S2** (2 weeks)   | Phase 2 docs shell + sidebar + Prose       | Docs feel like a new product    |
| **S3** (1 week)    | Phase 2 search + TOC scroll-spy            | Discovery works at scale        |
| **S4** (1–2 weeks) | Phase 3 marketing unification              | One journey end-to-end          |
| **S5** (1 week)    | Phase 4 layer identity                     | Libraries visually coherent     |
| **S6** (1 week)    | Phase 5 agent chrome                       | Eristack-specific docs UX       |
| **S7** (1 week)    | Phase 6 polish + QA                        | Ship                            |

**Total:** ~8–10 weeks for full overhaul (can parallelize S4/S5 after S2).

---

## What we deliberately do NOT change

- Package markdown paths (`packages/*/docs`) — still source of truth
- Web rendering pipeline architecture (`docs.ts` + remark) — evolve plugins, don’t rewrite to MDX unless needed
- Category order (primitive → … → ai)
- GitHub source links per page

---

## Decisions — status

| # | Topic | Status |
| --- | --- | --- |
| 0.1 | Visual direction | **Done** — editorial-first hybrid |
| 0.2 | Docs header | **Done** — slim bar on `/docs/*` |
| 0.3 | Layer + package visuals | **Done** — both; full catalog coverage |
| 0.4 | Agent skill-load strips | **Deferred** — decide in S6 |
| 0.5 | Search | **Done** — build-time body index |
| 0.6 | Logo | **Done** — generate v1 SVG in S1 |
| 0.7 | Display typography | **S1 locked:** Plus Jakarta Sans (UI/body) + Newsreader (hero/display) + JetBrains Mono (code). Docs titles sans; heroes serif. |

---

## Success metrics

- Time-to-first-doc-read from homepage ↓
- Cmd+K search success (manual QA checklist)
- Visual differentiation test: “is this Eristack?” vs generic shadcn
- Mobile docs usability (sidebar + TOC)
- No regression: all doc routes build, package docs still render from monorepo paths

---

## Key file map (execution reference)

| Concern                | Path                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| Tokens / prose CSS     | `apps/web/src/app/globals.css`                                        |
| Site config / packages | `apps/web/src/lib/site.ts`                                            |
| Docs data              | `apps/web/src/lib/docs.ts`                                            |
| Markdown pipeline      | `apps/web/src/components/markdown.tsx`                                |
| Docs article           | `apps/web/src/components/docs-article.tsx`                            |
| Docs sidebar           | `apps/web/src/components/docs-sidebar.tsx`                            |
| Global header          | `apps/web/src/components/site-header.tsx`                             |
| Search                 | `apps/web/src/components/command-menu.tsx`, `src/lib/search-index.ts` |
| Layer accents          | `apps/web/src/lib/layer-theme.ts`                                     |
| Marketing heroes       | `apps/web/src/components/stack/page-hero.tsx`                         |
| Package motifs         | `apps/web/src/components/stack/library-motif.tsx`                     |

---

## Promotion (when finished)

Per `_ai-docs` workflow: promote summary into `apps/web/DESIGN.md` or `roadmap/` entry; delete this folder after ship.
