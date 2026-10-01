// AUTO-GENERATED — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { KnowledgeCatalog } from "../types.js";

export const catalog = {
  "generatedAt": "2026-10-01T08:26:15.731Z",
  "packages": [
    {
      "name": "@eristack/abac",
      "version": "0.2.4",
      "description": "Attribute-based access control for Eristack: policy functions over subject/resource/environment attributes",
      "slug": "abac",
      "adapters": [
        "backseat",
        "backseat/store",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "abac-adapters",
          "name": "abac-adapters",
          "packageName": "@eristack/abac",
          "description": "@eristack/abac adapters: express createRequirePolicy, nest AbacModule + AbacGuard + RequirePolicy + AbacContextFactory, react usePolicy. Use when wiring attribute policy checks into HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-adapters"
        },
        {
          "id": "abac-core",
          "name": "abac-core",
          "packageName": "@eristack/abac",
          "description": "Pure @eristack/abac: createAbac, registerPolicy, evaluate/authorize, attrs helpers — attribute-based policies (algorithms with arguments → boolean). Use for per-user limits and scopes (e.g. max book value) beyond boolean RBAC.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-core"
        }
      ]
    },
    {
      "name": "@eristack/address",
      "version": "0.1.1",
      "description": "Normalized postal addresses with ISO country codes — string fields, no geocoding",
      "slug": "address",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "address-core",
          "name": "address-core",
          "packageName": "@eristack/address",
          "description": "@eristack/address normalized PostalAddress with ISO alpha-2 country codes — trim, formatAddressOneLine/Lines, isSameCountry. App owns partner tables; no geocoding.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/address#address-core"
        }
      ]
    },
    {
      "name": "@eristack/ai-dev",
      "version": "0.1.6",
      "description": "Unified agent-first dev tooling for Eristack monorepos: plan (token-minimal), check profiles, sync, compact JSON + MCP",
      "slug": "ai-dev",
      "adapters": [
        "repo"
      ],
      "skills": [
        {
          "id": "ai-dev-core",
          "name": "ai-dev-core",
          "packageName": "@eristack/ai-dev",
          "description": "@eristack/ai-dev unified monorepo tooling: eristack plan (token-minimal), eristack check profiles (catalog/pr/full = CI), sync docs/knowledge, MCP dev_plan/dev_check. Use before ad-hoc pnpm script chains or reading every check doc.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-dev#ai-dev-core"
        }
      ]
    },
    {
      "name": "@eristack/ai-ticket-generator",
      "version": "0.1.2",
      "description": "Generate portable maintainer tickets (bugs + suggestions) for every @eristack package — logs, scenario, fix plan, and agent-ready handoff files",
      "slug": "ai-ticket-generator",
      "adapters": [],
      "skills": [
        {
          "id": "ai-ticket-bug",
          "name": "ai-ticket-bug",
          "packageName": "@eristack/ai-ticket-generator",
          "description": "Generate a portable @eristack bug ticket (logs, scenario, repro, fix plan, agent handoff) as a markdown file the user can send to maintainers. Use when a consumer hits a package bug or wants a fixer-upper file for support.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug"
        },
        {
          "id": "ai-ticket-suggest",
          "name": "ai-ticket-suggest",
          "packageName": "@eristack/ai-ticket-generator",
          "description": "Turn a user feature idea into a portable @eristack suggestion ticket with feasibility (possible/partial/unlikely/needs-decision) and an implementation sketch for maintainers/agents. Use when a consumer proposes a change.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest"
        }
      ]
    },
    {
      "name": "@eristack/ai-workflow",
      "version": "0.1.2",
      "description": "Local-first AI workflow for Eristack projects: MCP server, FTS+vector index, backlog/sprint/ADR artifacts — low-token agent tools that do not replace existing editors or Intent",
      "slug": "ai-workflow",
      "adapters": [],
      "skills": [
        {
          "id": "ai-workflow-core",
          "name": "ai-workflow-core",
          "packageName": "@eristack/ai-workflow",
          "description": "Local-first @eristack/ai-workflow: .eristack/workflow backlog/sprints/ADR/summary, FTS+vector index, low-token search discipline. Use when scaffolding AI-native project memory or sprint cadence without replacing Intent, git, or editors.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core"
        },
        {
          "id": "ai-workflow-mcp",
          "name": "ai-workflow-mcp",
          "packageName": "@eristack/ai-workflow",
          "description": "Install and use the eristack-workflow MCP server alongside existing MCP tools. Covers Cursor/Claude config, tool inventory, and when to search vs read_chunk. Use when wiring @eristack/ai-workflow into a consumer project.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-mcp"
        }
      ]
    },
    {
      "name": "@eristack/api-key",
      "version": "0.1.0",
      "description": "Generate, hash, and timing-safe verify API keys for partner B2B routes",
      "slug": "api-key",
      "adapters": [],
      "skills": [
        {
          "id": "api-key-core",
          "name": "api-key-core",
          "packageName": "@eristack/api-key",
          "description": "@eristack/api-key generateApiKey (prefix_secret + public keyId), hashApiKey (peppered SHA-256), verifyApiKey (constant-time, never throws) — partner/B2B machine credentials for /partner routes. App owns the api_keys table (keyId + hash, never the key). Guard order: rate-limit → api-key → idempotency. Not human login (@eristack/jwt-auth) or OAuth clients (@eristack/oauth/provider).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/api-key#api-key-core"
        }
      ]
    },
    {
      "name": "@eristack/backseat",
      "version": "0.1.9",
      "description": "Frontend mock backend engine: in-browser REST server with pluggable store, controllers, and TanStack Query hooks",
      "slug": "backseat",
      "adapters": [
        "adapters",
        "client",
        "drizzle",
        "express",
        "nest",
        "ports",
        "react",
        "seeds",
        "store",
        "testing",
        "workshop"
      ],
      "skills": [
        {
          "id": "backseat-core",
          "name": "backseat-core",
          "packageName": "@eristack/backseat",
          "description": "@eristack/backseat: frontend-first in-browser REST engine — flexible registerRoute controllers, registerAction, splat paths, IndexedDB store, BackseatDevtools. Memory store for tests only. Agents peek at handlers/snapshots when backend is built later.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/backseat#backseat-core"
        }
      ]
    },
    {
      "name": "@eristack/business-calendar",
      "version": "0.1.0",
      "description": "Business days and holidays on YYYY-MM-DD wall dates — no timestamp import in core",
      "slug": "business-calendar",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "business-calendar-core",
          "name": "business-calendar-core",
          "packageName": "@eristack/business-calendar",
          "description": "@eristack/business-calendar createBusinessCalendar → isBusinessDay / nextBusinessDay / addBusinessDays on YYYY-MM-DD wall dates, plus normalizeWallDate/addWallDays. Use for due dates, SLA deadlines, and posting-date guards; holidays come from an app table. Not instants (@eristack/timestamp) or fiscal periods (@eristack/fiscal-calendar).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/business-calendar#business-calendar-core"
        }
      ]
    },
    {
      "name": "@eristack/checksum",
      "version": "0.1.0",
      "description": "SHA-256 hex normalize and constant-time compare for exports and file refs",
      "slug": "checksum",
      "adapters": [],
      "skills": [
        {
          "id": "checksum-core",
          "name": "checksum-core",
          "packageName": "@eristack/checksum",
          "description": "@eristack/checksum sha256Hex, normalizeChecksumHex, checksumEquals — SHA-256 digests for file refs and exports with constant-time compare. Use when storing or verifying a checksum; not for password/API-key hashing or hash-chained ledgers.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/checksum#checksum-core"
        }
      ]
    },
    {
      "name": "@eristack/command-palette",
      "version": "0.1.0",
      "description": "Headless command palette state and simple dialog shell",
      "slug": "command-palette",
      "adapters": [],
      "skills": [
        {
          "id": "command-palette-core",
          "name": "command-palette-core",
          "packageName": "@eristack/command-palette",
          "description": "@eristack/command-palette useCommandPalette(initialOpen?) → { open, setOpen, openPalette, closePalette, togglePalette } + CommandPaletteDialog { open, onClose, title, children } (aria-modal shell, backdrop click closes, null when closed, erista-command-palette* hooks). Use for Cmd/Ctrl+K navigation in ERP apps; app supplies commands (Router routes, rbac-filtered), search, arrow keys, Escape, and CSS. No fuzzy search, registry, or focus trap.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/command-palette#command-palette-core"
        }
      ]
    },
    {
      "name": "@eristack/comms",
      "version": "0.1.2",
      "description": "Transactional email, SMS, and WhatsApp — SendGrid, Postmark, Mailgun, Resend, Twilio, Vonage, Meta drivers, Drizzle delivery log, Express webhooks",
      "slug": "comms",
      "adapters": [
        "drizzle",
        "express",
        "mailgun",
        "meta-whatsapp",
        "nest",
        "postmark",
        "resend",
        "rest",
        "sendgrid",
        "testing",
        "twilio",
        "vonage",
        "zod"
      ],
      "skills": [
        {
          "id": "comms-adapters",
          "name": "comms-adapters",
          "packageName": "@eristack/comms",
          "description": "@eristack/comms/express createCommsRouter — POST /send, GET /messages/:id, POST /webhooks/:vendor; Twilio x-twilio-webhook-url header.",
          "type": "adapters",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/comms#comms-adapters"
        },
        {
          "id": "comms-core",
          "name": "comms-core",
          "packageName": "@eristack/comms",
          "description": "@eristack/comms createCommsHub — idempotent email/SMS/WhatsApp sends, vendor drivers, delivery log. Email: SendGrid, Postmark, Mailgun, Resend. Drizzle default; memory drivers tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/comms#comms-core"
        }
      ]
    },
    {
      "name": "@eristack/contact",
      "version": "0.1.0",
      "description": "Contact roles and channel list normalization on a party — compose with person/phone/email",
      "slug": "contact",
      "adapters": [],
      "skills": [
        {
          "id": "contact-core",
          "name": "contact-core",
          "packageName": "@eristack/contact",
          "description": "@eristack/contact normalizeContactList, primaryContact, CONTACT_ROLES — validate a party's contact channels (role, personId/phone/email, one isPrimary max) as a JSON value on app-owned partner rows. Normalize phone/email upstream with @eristack/phone / @eristack/email-address.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/contact#contact-core"
        }
      ]
    },
    {
      "name": "@eristack/currency-pair",
      "version": "0.1.0",
      "description": "Base/quote currency pair validation and canonical pair keys — no FX rates",
      "slug": "currency-pair",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "currency-pair-core",
          "name": "currency-pair-core",
          "packageName": "@eristack/currency-pair",
          "description": "@eristack/currency-pair normalizeCurrencyPair, formatPairKey (\"USD/IDR\"), invertPair, currencyPairSchema — validate base/quote against the money registry and key FX rate tables canonically. No rates or conversion here (that is @eristack/money Conversion).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/currency-pair#currency-pair-core"
        }
      ]
    },
    {
      "name": "@eristack/data-grid",
      "version": "0.2.6",
      "description": "Dynamic list query primitives: multi-field filters, search mode, multi-sort, offset/cursor pagination for Eristack services and capabilities",
      "slug": "data-grid",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "data-grid-adapters",
          "name": "data-grid-adapters",
          "packageName": "@eristack/data-grid",
          "description": "@eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery, rest createDataGridListAction + {items,pageInfo,query}, express middleware, nest DataGridModule + ParseDataGridPipe, client createDataGridClient, react useDataGridController (draft/commit filter rows) + useDataGridList. Use when wiring list HTTP/SQL/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-adapters"
        },
        {
          "id": "data-grid-core",
          "name": "data-grid-core",
          "packageName": "@eristack/data-grid",
          "description": "Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params (TanStack Router–aligned filters/sorts), decimal/money field types for string amount sort/filter without Number(), toSearch/fromSearch, advanced vs search modes, filter ops, multi-sort, offset/cursor pagination, applyInMemory. Use for dynamic list queries without HTTP or Drizzle.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-core"
        }
      ]
    },
    {
      "name": "@eristack/design-system",
      "version": "0.1.1",
      "description": "Erista design tokens, Tailwind preset, and React density context for ERP UI",
      "slug": "design-system",
      "adapters": [
        "react",
        "tokens.css"
      ],
      "skills": [
        {
          "id": "design-system-core",
          "name": "design-system-core",
          "packageName": "@eristack/design-system",
          "description": "@eristack/design-system Erista tokens (12 --erista-* CSS vars: HSL colour triplets, radius, density gaps) via tokens.css subpath or ERISTACK_CSS_VARS/eristaCssVarMap, Tailwind v3 tailwindPreset (background/foreground/primary/muted/border/destructive, rounded, density spacing), and React DensityProvider/useDensity()/densityClassNames. Load first for any @eristack/ui-* app; shadcn components stay in the app. No typography/shadow tokens; useDensity has no setter.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/design-system#design-system-core"
        }
      ]
    },
    {
      "name": "@eristack/dimension",
      "version": "0.1.0",
      "description": "L×W×H dimension triple as decimal strings — cubic volume, optional unit label",
      "slug": "dimension",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "dimension-core",
          "name": "dimension-core",
          "packageName": "@eristack/dimension",
          "description": "@eristack/dimension Dimension { length, width, height, unit? } positive decimal strings: normalizeDimension (trim, positive finite, canonical toFixed, unit label trimmed, DimensionParseError code DIMENSION_PARSE_ERROR), dimensionVolume (L×W×H HALF_UP to scale default 6, padded), formatDimension \"L × W × H unit\", zod dimensionSchema. Use for SKU packaging levels, parcel/pallet dims, volumetric weight, bin fit; unit conversion via @eristack/uom in the app. Drizzle numeric columns.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/dimension#dimension-core"
        }
      ]
    },
    {
      "name": "@eristack/doc-number",
      "version": "0.3.5",
      "description": "Document number format, parse, and sequence primitives for Eristack",
      "slug": "doc-number",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "doc-number-adapters",
          "name": "doc-number-adapters",
          "packageName": "@eristack/doc-number",
          "description": "@eristack/doc-number adapters: drizzle FormatStore + SequenceStore (doc_number_formats / doc_number_sequences), rest format CRUD + preview, express createDocNumberRouter, nest DocNumberModule, client createDocNumberClient, react DocNumberProvider / useDocNumberFormats. Use when persisting formats or wiring format-configuration HTTP/frontend shells; app injects db + docNumber.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-adapters"
        },
        {
          "id": "doc-number-core",
          "name": "doc-number-core",
          "packageName": "@eristack/doc-number",
          "description": "Pure @eristack/doc-number: token patterns ({YYYY}/{YY}/{MM}/{DD}/{SEQ:n}), formatDocumentNumber, parseDocumentNumber, createDocNumber, registerFormat, updateFormat, listFormats, getFormatById, next, peekNext, preview, ResetPeriod, FormatStore, SequenceStore, Incrementer, memory stores. Use for document numbers without HTTP or Drizzle.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core"
        }
      ]
    },
    {
      "name": "@eristack/doc-shell",
      "version": "0.1.0",
      "description": "Document detail page shell — header, actions, body slots",
      "slug": "doc-shell",
      "adapters": [],
      "skills": [
        {
          "id": "doc-shell-core",
          "name": "doc-shell-core",
          "packageName": "@eristack/doc-shell",
          "description": "@eristack/doc-shell presentational document page chrome: DocShell { header, actions, children }, DocHeader { title, subtitle, badges }, DocActionBar { leading, trailing } with stable erista-doc-* CSS hooks and data-component attributes. Use for invoice/PO/job detail routes (with line-grid, policy-ui gates, multitab tabs). No state, no styles shipped, no pbac logic — app owns those.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-shell#doc-shell-core"
        }
      ]
    },
    {
      "name": "@eristack/doc-transitions",
      "version": "0.1.1",
      "description": "Preset ERP document status graphs for @eristack/pbac documents.transitions()",
      "slug": "doc-transitions",
      "adapters": [],
      "skills": [
        {
          "id": "doc-transitions-core",
          "name": "doc-transitions-core",
          "packageName": "@eristack/doc-transitions",
          "description": "@eristack/doc-transitions preset status graphs (publication, decision, journal, lock, outstanding) for pbac documents.transitions(). Use instead of copy-paste status tables when wiring ERP document PATCH actions.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-transitions#doc-transitions-core"
        }
      ]
    },
    {
      "name": "@eristack/drizzle-kit-helpers",
      "version": "0.1.1",
      "description": "Shared drizzle-kit config fragments for Eristack consumer monorepos (pg prod, sqlite tests)",
      "slug": "drizzle-kit-helpers",
      "adapters": [],
      "skills": [
        {
          "id": "drizzle-kit-helpers-core",
          "name": "drizzle-kit-helpers-core",
          "packageName": "@eristack/drizzle-kit-helpers",
          "description": "@eristack/drizzle-kit-helpers eristackProdPostgresConfig(schema) / eristackTestSqliteConfig(schema) / defineEristackDrizzleConfig({ dialect, schema, out, dbCredentialsEnv?, migrationsFolder? }) — conventional drizzle-kit configs (postgresql reads DATABASE_URL, sqlite reads SQLITE_URL, separate out folders per dialect) for apps composing Eristack Drizzle tables. Dev-only; URL read from env at call time. Not MySQL.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/drizzle-kit-helpers#drizzle-kit-helpers-core"
        }
      ]
    },
    {
      "name": "@eristack/email-address",
      "version": "0.1.0",
      "description": "Normalized email local@domain strings for contact channels",
      "slug": "email-address",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "email-address-core",
          "name": "email-address-core",
          "packageName": "@eristack/email-address",
          "description": "@eristack/email-address normalizeEmail, parseEmailAddress, emailEquals, emailAddressSchema — lower-case local@domain normalization at the API boundary so uniqueness and contact lookups are plain string compares. Not SMTP (@eristack/comms) or templates (@eristack/email-template).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/email-address#email-address-core"
        }
      ]
    },
    {
      "name": "@eristack/email-template",
      "version": "0.1.0",
      "description": "{{var}} HTML/text email template render and key extraction — pair with @eristack/comms",
      "slug": "email-template",
      "adapters": [],
      "skills": [
        {
          "id": "email-template-core",
          "name": "email-template-core",
          "packageName": "@eristack/email-template",
          "description": "@eristack/email-template renderEmailTemplate(template, vars, { escapeHtml? }) and extractTemplateKeys(template) — logic-free {{key}} substitution for tenant-editable transactional email (subject/html/text) rendered in an @eristack/outbox worker and sent via @eristack/comms. Missing keys render empty; validate against a per-message-type variable contract on save. Format money/dates in the app before passing vars.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/email-template#email-template-core"
        }
      ]
    },
    {
      "name": "@eristack/entity-id",
      "version": "0.1.0",
      "description": "UUID v7 entity identifiers — sortable, parseable, Drizzle column helper",
      "slug": "entity-id",
      "adapters": [
        "drizzle",
        "zod"
      ],
      "skills": [
        {
          "id": "entity-id-core",
          "name": "entity-id-core",
          "packageName": "@eristack/entity-id",
          "description": "@eristack/entity-id UUID v7 generate/parse/compare, entityIdToDate, Drizzle entityIdColumn, zod entityIdSchema — sortable PKs for new ERP tables. Wave 13 E1; no sibling deps.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/entity-id#entity-id-core"
        }
      ]
    },
    {
      "name": "@eristack/epoch",
      "version": "0.1.3",
      "description": "Headless data-version epochs for cache invalidation: compare client epoch vs server, bump on mutation, Drizzle default",
      "slug": "epoch",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "logger",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "epoch-adapters",
          "name": "epoch-adapters",
          "packageName": "@eristack/epoch",
          "description": "Wire @eristack/epoch: Drizzle createEpochTables/createDrizzleEpochStore, Express createEpochRouter, Nest EpochModule, createEpochClient, useEpochCachePolicy React hook, registerEpochBackseat for prototypes.",
          "type": "adapters",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-adapters"
        },
        {
          "id": "epoch-core",
          "name": "epoch-core",
          "packageName": "@eristack/epoch",
          "description": "@eristack/epoch headless data-version counters: current/bump per scope, compareEpochs use-cache vs refetch, resolveCachePolicy, StaleEpochError. Drizzle default; memory store tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-core"
        }
      ]
    },
    {
      "name": "@eristack/file-manager",
      "version": "0.1.2",
      "description": "Headless file uploads: S3 presigned PUT/GET (inline view by default; optional attachment filename), server uploads, FileRef for Drizzle columns, REST/Express/React dev tools",
      "slug": "file-manager",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "s3",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "file-manager-adapters",
          "name": "file-manager-adapters",
          "packageName": "@eristack/file-manager",
          "description": "@eristack/file-manager adapters: drizzle tables/store, REST + express createFileManagerRouter, client uploadViaPresign, react FileUploadDropzone and FileManagerDevPanel. Use when wiring S3 uploads in API and Vite apps.",
          "type": "adapters",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/file-manager#file-manager-adapters"
        },
        {
          "id": "file-manager-core",
          "name": "file-manager-core",
          "packageName": "@eristack/file-manager",
          "description": "Pure @eristack/file-manager: createFileManager, FileRef JSON for DB columns, presigned upload sessions, server uploadFromServer, resolveDownloadUrl (inline GET by default; pass downloadFilename for S3 attachment disposition), buildObjectKey. S3 via @eristack/file-manager/s3. Memory driver tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/file-manager#file-manager-core"
        }
      ]
    },
    {
      "name": "@eristack/filter-builder",
      "version": "0.1.0",
      "description": "Stub filter chip bar and sheet UI for data-grid list filters",
      "slug": "filter-builder",
      "adapters": [],
      "skills": [
        {
          "id": "filter-builder-core",
          "name": "filter-builder-core",
          "packageName": "@eristack/filter-builder",
          "description": "@eristack/filter-builder v0 chrome for data-grid list filters: FilterChipBar { children } and FilterSheet { open, title, children, footer } (role=dialog, null when closed) with erista-filter-* CSS hooks. Bind to @eristack/data-grid controller draft (filterRows, fields, opsForField, add/update/removeFilterRow, commitFilters, isDirty) and form-ui editors; string values only. No state, no pickers, no focus trap.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/filter-builder#filter-builder-core"
        }
      ]
    },
    {
      "name": "@eristack/financial-ledger",
      "version": "0.2.6",
      "description": "Accounting ledger on hash-chained-ledger keyed by accountId, amounts via @eristack/money",
      "slug": "financial-ledger",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "financial-ledger-adapters",
          "name": "financial-ledger-adapters",
          "packageName": "@eristack/financial-ledger",
          "description": "@eristack/financial-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore for durable GL chains on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-adapters"
        },
        {
          "id": "financial-ledger-core",
          "name": "financial-ledger-core",
          "packageName": "@eristack/financial-ledger",
          "description": "@eristack/financial-ledger: createFinancialLedger post/list/snapshot/verify by accountId+currency with @eristack/money. Default store is Drizzle — memory is tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-core"
        }
      ]
    },
    {
      "name": "@eristack/fiscal-calendar",
      "version": "0.1.2",
      "description": "Fiscal years and periods with open/closed flags — wall-date boundaries on @eristack/timestamp",
      "slug": "fiscal-calendar",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "fiscal-calendar-core",
          "name": "fiscal-calendar-core",
          "packageName": "@eristack/fiscal-calendar",
          "description": "@eristack/fiscal-calendar fiscal years and open/closed periods on @eristack/timestamp wall dates — findPeriodForDate, assertPeriodOpen, listPeriods. Pair with doc-transitions lockGraph for period close.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/fiscal-calendar#fiscal-calendar-core"
        }
      ]
    },
    {
      "name": "@eristack/form-ui",
      "version": "0.1.0",
      "description": "Native React form controls wired to @eristack money, percent, and timestamp",
      "slug": "form-ui",
      "adapters": [],
      "skills": [
        {
          "id": "form-ui-core",
          "name": "form-ui-core",
          "packageName": "@eristack/form-ui",
          "description": "@eristack/form-ui string-first native inputs: MoneyInput { amount, currency, onAmountChange, onParsed, round } (blur → submitAmountOnlyFormValue: HALF_EVEN to currency scale, \"12.345\"→\"12.34\", no padding, round:false keeps scale, invalid throws ParseError), PercentInput { value, onValueChange }, TimestampWallInput { value YYYY-MM-DD, onValueChange }, FormField { label, hint, error }. Use for document header fields, line-grid cells, filter editors with TanStack Form; values equal API strings (MoneyJSON/decimal/wall). No number inputs, no styles.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/form-ui#form-ui-core"
        }
      ]
    },
    {
      "name": "@eristack/fraction",
      "version": "0.1.0",
      "description": "Exact rational numbers as reduced fractions — string numerators/denominators, no float literals",
      "slug": "fraction",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "fraction-core",
          "name": "fraction-core",
          "packageName": "@eristack/fraction",
          "description": "@eristack/fraction exact rationals as reduced num/den strings — parse n/d and mixed numbers, exact arithmetic, approximateFraction for irrationals/decimals with max denominator. Not float math.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/fraction#fraction-core"
        }
      ]
    },
    {
      "name": "@eristack/geo",
      "version": "0.1.0",
      "description": "Latitude and longitude as decimal strings — normalize and haversine distance",
      "slug": "geo",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "geo-core",
          "name": "geo-core",
          "packageName": "@eristack/geo",
          "description": "@eristack/geo GeoPoint { latitude, longitude } decimal strings: normalizeGeoPoint (trim, range check lat ±90 / lng ±180, canonical toFixed, GeoParseError code GEO_PARSE_ERROR), geoDistanceKm (haversine, R=6371, HALF_UP to scale default 3, zero-padded), formatGeoPoint \"lat, lng\", zod geoPointSchema. Use for depot/site coordinates and radius checks; geocoding, routing, and PostGIS stay in the app. Drizzle numeric(10,7) not double.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/geo#geo-core"
        }
      ]
    },
    {
      "name": "@eristack/hash-chained-ledger",
      "version": "0.1.4",
      "description": "Append-only hash-chained ledger primitive: opening/in/out/adjustment/closing, type refs, chain verify and tamper detection",
      "slug": "hash-chained-ledger",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "hash-chained-ledger-adapters",
          "name": "hash-chained-ledger-adapters",
          "packageName": "@eristack/hash-chained-ledger",
          "description": "@eristack/hash-chained-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore. Use for durable chains on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-adapters"
        },
        {
          "id": "hash-chained-ledger-core",
          "name": "hash-chained-ledger-core",
          "packageName": "@eristack/hash-chained-ledger",
          "description": "Pure @eristack/hash-chained-ledger: createHashChainedLedger with Drizzle store by default, append/snapshot/verify, balance equation, SHA-256 chain. Memory store is unit tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-core"
        }
      ]
    },
    {
      "name": "@eristack/health",
      "version": "0.1.0",
      "description": "Liveness and readiness health check registry with Express and Nest mount helpers",
      "slug": "health",
      "adapters": [
        "express",
        "nest"
      ],
      "skills": [
        {
          "id": "health-core",
          "name": "health-core",
          "packageName": "@eristack/health",
          "description": "@eristack/health createHealthRegistry + registerCheck(name, fn) → runLiveness / runReadiness with per-check durationMs; aggregateStatus maps ok→200, degraded→503. Express createHealthRouter {liveness, readiness}; Nest HealthModule.forRoot + HEALTH_REGISTRY. Use for /health and /ready probes (Postgres, outbox lag, S3). Checks must be wrapped so they never throw or hang; they run sequentially.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/health#health-core"
        }
      ]
    },
    {
      "name": "@eristack/idempotency",
      "version": "0.1.1",
      "description": "Idempotency-Key guard with Drizzle store, scoped keys, lease, Express/Nest/client adapters",
      "slug": "idempotency",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "idempotency-adapters",
          "name": "idempotency-adapters",
          "packageName": "@eristack/idempotency",
          "description": "@eristack/idempotency adapters: drizzle createIdempotencyTables + createDrizzleIdempotencyStore (production store), express wrapIdempotentHandler({ guard, scopeFromReq }, handler) → replay 200 / 409 JSON, nest IdempotencyInterceptor + mapIdempotencyError, client createIdempotencyClientFetch (one key per submit intent), zod schemas. Use when wiring the guard into HTTP and the browser; no header means the handler runs unguarded.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/idempotency#idempotency-adapters"
        },
        {
          "id": "idempotency-core",
          "name": "idempotency-core",
          "packageName": "@eristack/idempotency",
          "description": "@eristack/idempotency createIdempotencyGuard({ store, defaultLeaseMs, waitOnPending }) → run(key, fn) / runScoped({ scope: { tenantId, scope }, key, requestHash, fn }): atomic claim with lease, run once, replay stored result, 409 IDEMPOTENCY_REQUEST_MISMATCH on different body, IDEMPOTENCY_CONFLICT while pending. Pair with domain UNIQUE(tenant_id, idempotency_key). Drizzle store is production; memory store tests only. Architecture: #idempotency-and-outbox.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/idempotency#idempotency-core"
        }
      ]
    },
    {
      "name": "@eristack/iso-3166",
      "version": "0.1.0",
      "description": "ISO 3166-1 country codes and ISO 3166-2 subdivision normalization — assigned alpha-2/alpha-3 registry",
      "slug": "iso-3166",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "iso-3166-core",
          "name": "iso-3166-core",
          "packageName": "@eristack/iso-3166",
          "description": "@eristack/iso-3166 assigned ISO 3166-1 alpha-2/alpha-3 and ISO 3166-2 subdivision normalization. Use when validating country codes beyond two-letter format — not for postal address shape (address) or port codes (unlocode).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/iso-3166#iso-3166-core"
        }
      ]
    },
    {
      "name": "@eristack/jwt-auth",
      "version": "0.4.5",
      "description": "Canonical JWT access + refresh-token auth primitives for Eristack",
      "slug": "jwt-auth",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "jwt-auth-adapters",
          "name": "jwt-auth-adapters",
          "packageName": "@eristack/jwt-auth",
          "description": "@eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore + CredentialStore (jwt_auth_credentials child of users), headless rest login/ sessions, express createJwtAuthRouter, nest JwtAuthModule JwtAuthGuard, client createJwtAuthClient login, react JwtAuthProvider useJwtAuth. Use when wiring persistence or HTTP/frontend shells.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
        },
        {
          "id": "jwt-auth-core",
          "name": "jwt-auth-core",
          "packageName": "@eristack/jwt-auth",
          "description": "Pure @eristack/jwt-auth token + credentials lifecycle: createJwtAuth, registerCredentials, login, changePassword, issueTokens, verifyAccessToken, refresh rotation, revoke, CredentialStore, RefreshTokenStore, opaque refresh hashes, family reuse detection. Use when implementing JWT access + refresh and optional username/password without HTTP/DB frameworks.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
        }
      ]
    },
    {
      "name": "@eristack/line-grid",
      "version": "0.1.0",
      "description": "Editable QUPS line table with patchLine recalculation hook",
      "slug": "line-grid",
      "adapters": [],
      "skills": [
        {
          "id": "line-grid-core",
          "name": "line-grid-core",
          "packageName": "@eristack/line-grid",
          "description": "@eristack/line-grid useLineGridRecalc(CalculateLineInput) → { line: CalculatedLine, applyPatch (PatchLineInput → qups patchLine), recalculate } and LineGrid { line, columns {id, header}, renderCell(id, line) } single-row table with erista-line-grid hook. Use for invoice/PO/job line editors with form-ui cells; truth modes quantity+unitPrice | quantity+subtotal | unitPrice+subtotal; fields subtotal/net/total (no lineTotal). Same calculateLine on server insert. N lines = N grids or own table; keyboard via spreadsheet-operator.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/line-grid#line-grid-core"
        }
      ]
    },
    {
      "name": "@eristack/list-shell",
      "version": "0.1.0",
      "description": "Presentational list page layout, toolbar, and TanStack Query state banners",
      "slug": "list-shell",
      "adapters": [],
      "skills": [
        {
          "id": "list-shell-core",
          "name": "list-shell-core",
          "packageName": "@eristack/list-shell",
          "description": "@eristack/list-shell presentational list page frame: ListPageLayout { toolbar, banner, children }, ListToolbar { leading, children, trailing }, QueryStateBanner { isLoading, isError, isEmpty, messages } (loading→error→empty precedence, role=status/alert) with erista-list-* CSS hooks. Use with @eristack/data-grid/react useDataGridList ({ schema, client }) → items/pageInfo/controller and filter-builder chips. No fetching, no table, no filter logic.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/list-shell#list-shell-core"
        }
      ]
    },
    {
      "name": "@eristack/logger",
      "version": "0.1.1",
      "description": "JSON-lines structured logger with request context and Express/Nest adapters",
      "slug": "logger",
      "adapters": [
        "express",
        "nest"
      ],
      "skills": [
        {
          "id": "logger-core",
          "name": "logger-core",
          "packageName": "@eristack/logger",
          "description": "@eristack/logger JSON-lines logger: createLogger({ name, level default info, context, sink }) → debug/info/warn(msg, data), error(msg, err, data), child(context); record { level, message, timestamp, name, context, data, error{name,message,stack} }. Express createLoggerMiddleware ({ logger, requestIdHeader x-request-id, resolveContext }) + getRequestLogger(req) logs request.start/finish with status+durationMs; Nest LoggerModule.forRoot + LoggingInterceptor (APP_INTERCEPTOR) adds request.error. Sink defaults console.log or __ERISTACK_LOGGER_SINK__. Server-only; no redaction/transport.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/logger#logger-core"
        }
      ]
    },
    {
      "name": "@eristack/master-detail",
      "version": "0.1.0",
      "description": "Two-pane master list + detail layout for picker flows",
      "slug": "master-detail",
      "adapters": [],
      "skills": [
        {
          "id": "master-detail-core",
          "name": "master-detail-core",
          "packageName": "@eristack/master-detail",
          "description": "@eristack/master-detail MasterDetailLayout { master, detail } — aside + section split with erista-master-detail__master/__detail CSS hooks for picker and list-then-edit workspaces. Master is usually @eristack/list-shell + data-grid; selection lives in Router search (?selected=), detail in TanStack Query. No selection state, no responsive logic, no className prop in v0.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/master-detail#master-detail-core"
        }
      ]
    },
    {
      "name": "@eristack/money",
      "version": "0.3.5",
      "description": "Money primitives for Eristack",
      "slug": "money",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "react/fields",
        "rest",
        "zod"
      ],
      "skills": [
        {
          "id": "money-adapters",
          "name": "money-adapters",
          "packageName": "@eristack/money",
          "description": "Persist and wire @eristack/money: Drizzle SQL columns, REST wire codec, Zod 4 schemas, Express/Nest HTTP, client revive, React form helpers including createAmountOnlyFieldValidators for flat amount strings + shared row currency (QUPS lines). Use when storing prices in SQL, validating API bodies, or mapping flat DB columns vs MoneyJSON.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-adapters"
        },
        {
          "id": "money-amounts",
          "name": "money-amounts",
          "packageName": "@eristack/money",
          "description": "Construct Money with strings or minor units, run same-currency arithmetic, totals (Money.sum/min/max/average), percentages (percentOf/plusPercent/minusPercent), ratios, Discount/Markup/Tax/Percent operators, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, or when an agent reaches for JS number literals for money.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
        },
        {
          "id": "money-ledger",
          "name": "money-ledger",
          "packageName": "@eristack/money",
          "description": "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
        }
      ]
    },
    {
      "name": "@eristack/multitab",
      "version": "0.2.3",
      "description": "Headless multi-tab workspace for React ERP screens — document tabs, state preservation, Router sync",
      "slug": "multitab",
      "adapters": [
        "react",
        "react/tanstack"
      ],
      "skills": [
        {
          "id": "multitab-core",
          "name": "multitab-core",
          "packageName": "@eristack/multitab",
          "description": "@eristack/multitab: headless multi-tab workspace for React ERP screens — tab model, closeGuard, TanStack Router sync. UI chrome stays in the app.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/multitab#multitab-core"
        }
      ]
    },
    {
      "name": "@eristack/oauth",
      "version": "0.1.0",
      "description": "OAuth2 client with 17+ IdP drivers (Google, Microsoft, GitHub, Apple, Okta, …) and authorization-server provider — PKCE, Drizzle, Express; hand off to jwt-auth",
      "slug": "oauth",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "provider",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "oauth-client-core",
          "name": "oauth-client-core",
          "packageName": "@eristack/oauth",
          "description": "@eristack/oauth consumer: createOAuthConsumer, PKCE, 17+ IdP drivers (Google, Microsoft, GitHub, Apple, Okta, …), Drizzle pending store. End at jwt-auth.issueTokens.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/oauth#oauth-client-core"
        },
        {
          "id": "oauth-provider-core",
          "name": "oauth-provider-core",
          "packageName": "@eristack/oauth",
          "description": "@eristack/oauth/provider: registerClient, authorization codes, PKCE token exchange, opaque access tokens for partner APIs — user must already be logged in via jwt-auth.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/oauth#oauth-provider-core"
        }
      ]
    },
    {
      "name": "@eristack/opinion",
      "version": "0.1.1",
      "description": "Opinionated ERP HTTP route table: document CRUD + PATCH /:id/:action transitions",
      "slug": "opinion",
      "adapters": [
        "express",
        "nest",
        "openapi"
      ],
      "skills": [
        {
          "id": "opinion-core",
          "name": "opinion-core",
          "packageName": "@eristack/opinion",
          "description": "@eristack/opinion ERP HTTP route table on @eristack/rest: options, data-grid, CRUD, PATCH /:id/:action for pbac/doc-transitions. Use when scaffolding document APIs instead of inventing paths per app.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/opinion#opinion-core"
        }
      ]
    },
    {
      "name": "@eristack/outbox",
      "version": "0.1.1",
      "description": "Transactional outbox enqueue + Drizzle worker batch for reliable comms and payment side effects",
      "slug": "outbox",
      "adapters": [
        "drizzle"
      ],
      "skills": [
        {
          "id": "outbox-core",
          "name": "outbox-core",
          "packageName": "@eristack/outbox",
          "description": "@eristack/outbox transactional outbox: createOutbox(store).enqueue({ id, aggregateType, aggregateId, messageType, payloadJson, idempotencyKey }) inside the domain TX (build the Drizzle store on the tx handle), processBatch(limit, handlers) in a worker → comms/payment/PDF with outbox:${id} keys. Duplicate key returns existing row; failed is terminal until your SQL sweep; one worker per table. Drizzle store production, memory store tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/outbox#outbox-core"
        }
      ]
    },
    {
      "name": "@eristack/payment-instrument",
      "version": "0.1.0",
      "description": "Token-safe payment card value types — display + gateway refs, PAN transient only, PCI-minded guards",
      "slug": "payment-instrument",
      "adapters": [
        "express",
        "zod"
      ],
      "skills": [
        {
          "id": "payment-instrument-core",
          "name": "payment-instrument-core",
          "packageName": "@eristack/payment-instrument",
          "description": "@eristack/payment-instrument token-safe card/debit display + gateway refs. CardPan is transient; toPersistable for Drizzle. Use before payment-manager or when modeling saved payment methods — never store PAN/CVV in SQL.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/payment-instrument#payment-instrument-core"
        }
      ]
    },
    {
      "name": "@eristack/payment-manager",
      "version": "0.1.1",
      "description": "Headless payment intents: Stripe/Xendit drivers, Drizzle history, webhooks, REST/Express/client — pairs with payment-instrument",
      "slug": "payment-manager",
      "adapters": [
        "backseat",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "stripe",
        "testing",
        "xendit",
        "zod"
      ],
      "skills": [
        {
          "id": "payment-manager-adapters",
          "name": "payment-manager-adapters",
          "packageName": "@eristack/payment-manager",
          "description": "@eristack/payment-manager adapters: drizzle tables/store, express createPaymentManagerRouter, stripe/xendit drivers, client, react hooks, backseat.",
          "type": "adapters",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/payment-manager#payment-manager-adapters"
        },
        {
          "id": "payment-manager-core",
          "name": "payment-manager-core",
          "packageName": "@eristack/payment-manager",
          "description": "Pure @eristack/payment-manager: createPaymentManager, PaymentDriver, idempotency, webhook handleWebhook, Money JSON amounts. Memory driver tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/payment-manager#payment-manager-core"
        }
      ]
    },
    {
      "name": "@eristack/pbac",
      "version": "0.2.3",
      "description": "Policy-based (software) access control for Eristack: business document rules that return true or false",
      "slug": "pbac",
      "adapters": [
        "backseat",
        "backseat/store",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "pbac-adapters",
          "name": "pbac-adapters",
          "packageName": "@eristack/pbac",
          "description": "@eristack/pbac adapters: express createRequireBusinessPolicy (409 on deny), nest PbacModule + PbacGuard + RequireBusinessPolicy, react useBusinessPolicy. Use when wiring document software policies into HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-adapters"
        },
        {
          "id": "pbac-core",
          "name": "pbac-core",
          "packageName": "@eristack/pbac",
          "description": "Pure @eristack/pbac: createPbac, registerPolicy, check/authorize, documents helpers — software/business policies over document state (usually not per-user). Use for rules like PO outstanding must be > 0 before goods receipt.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-core"
        }
      ]
    },
    {
      "name": "@eristack/pdf-render",
      "version": "0.1.0",
      "description": "HTML to PDF driver interface — Puppeteer/Playwright stays in the app or optional adapter",
      "slug": "pdf-render",
      "adapters": [],
      "skills": [
        {
          "id": "pdf-render-core",
          "name": "pdf-render-core",
          "packageName": "@eristack/pdf-render",
          "description": "@eristack/pdf-render createPdfRenderer(driver).render({ html, title? }) → { bytes, contentType } behind a PdfRenderDriver seam; createStubPdfDriver for tests/Backseat (not a valid PDF). App owns the engine (Puppeteer singleton or Gotenberg HTTP). Use for invoice/delivery-note PDFs rendered in an @eristack/outbox worker and stored via @eristack/file-manager.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/pdf-render#pdf-render-core"
        }
      ]
    },
    {
      "name": "@eristack/percent",
      "version": "0.1.2",
      "description": "Percent and basis-point ratios as strings — tax, discount, markup without float literals",
      "slug": "percent",
      "adapters": [
        "react",
        "zod"
      ],
      "skills": [
        {
          "id": "percent-core",
          "name": "percent-core",
          "packageName": "@eristack/percent",
          "description": "@eristack/percent ratio strings, basis points, percentOf/plus/minus for tax and discounts without float literals. Use before @eristack/money rounding at boundaries.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/percent#percent-core"
        }
      ]
    },
    {
      "name": "@eristack/person",
      "version": "0.1.0",
      "description": "Structured person name and gender identity — normalize and display, not HRIS",
      "slug": "person",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "person-core",
          "name": "person-core",
          "packageName": "@eristack/person",
          "description": "@eristack/person Person { name { given, family, middle?, prefix?, suffix? }, gender?, genderOther? }: normalizePerson / normalizePersonName (trim, required given+family, genderOther iff gender \"other\", PersonParseError code PERSON_PARSE), GENDER_IDENTITIES [unknown, woman, man, non_binary, prefer_not_to_say, other], normalizeGenderIdentity (\"Non-Binary\" → non_binary), formatPersonDisplay \"Prefix Given Middle Family Suffix\", formatPersonSortable \"Family Suffix, Given Middle\", zod personSchema. Use for contact/employee rows with structured Drizzle columns; compose with phone/email/contact in the handler — no sibling imports. Not org names or HRIS.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/person#person-core"
        }
      ]
    },
    {
      "name": "@eristack/phone",
      "version": "0.1.0",
      "description": "E.164 phone normalization — strict plus prefix, no libphonenumber in core",
      "slug": "phone",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "phone-core",
          "name": "phone-core",
          "packageName": "@eristack/phone",
          "description": "@eristack/phone normalizeE164, isValidE164, e164PhoneSchema, branded E164Phone — strict \"+CC…\" normalization at the API boundary for contacts and @eristack/comms SMS/WhatsApp. No country inference or libphonenumber; national-number forms add the dial code in the app/UI.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/phone#phone-core"
        }
      ]
    },
    {
      "name": "@eristack/policy-ui",
      "version": "0.1.0",
      "description": "RBAC and PBAC gate components with v0 allowed override",
      "slug": "policy-ui",
      "adapters": [],
      "skills": [
        {
          "id": "policy-ui-core",
          "name": "policy-ui-core",
          "packageName": "@eristack/policy-ui",
          "description": "@eristack/policy-ui Can { permission, allowed, fallback } and BusinessPolicyGate { policyId, allowed, fallback } — React gates that render children or fallback from a boolean. Use for action buttons on document pages/list toolbars; allowed comes from rbac useCan, pbac useBusinessPolicy, or server allowedActions. v0: allowed defaults true, ids are labels only, hidden is not enforcement.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/policy-ui#policy-ui-core"
        }
      ]
    },
    {
      "name": "@eristack/qups",
      "version": "0.3.4",
      "description": "Quantity / unit price / subtotal (QUPS) with 2-of-3 sources of truth, plus modifiers and tax — business line pricing on @eristack/money",
      "slug": "qups",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "qups-adapters",
          "name": "qups-adapters",
          "packageName": "@eristack/qups",
          "description": "Optional @eristack/qups/drizzle: qupsLineColumns injected into app detail tables; withQupsColumns from calculateLine for inserts. Profile/line stores only if you need a field catalog — everyday form/BE math uses calculateLine.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-adapters"
        },
        {
          "id": "qups-core",
          "name": "qups-core",
          "packageName": "@eristack/qups",
          "description": "Pure @eristack/qups business calculator: calculateLine / patchLine (plain strings for TanStack Form + BE), Qups 2-of-3 SoT, QUPS_TRUTH_MODES, isQupsTruthMode, PricingLine, modifiers, tax. Prefer calculateLine over inventing float qty/price math in UI or SQL.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-core"
        },
        {
          "id": "qups-line",
          "name": "qups-line",
          "packageName": "@eristack/qups",
          "description": "@eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation and BE insert; PricingLine when you already have Money. Use for invoice/order lines in the business layer — not float math in React.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-line"
        }
      ]
    },
    {
      "name": "@eristack/rate-limit",
      "version": "0.1.0",
      "description": "Fixed-window in-memory rate limiter — Redis adapter in app or later package",
      "slug": "rate-limit",
      "adapters": [],
      "skills": [
        {
          "id": "rate-limit-core",
          "name": "rate-limit-core",
          "packageName": "@eristack/rate-limit",
          "description": "@eristack/rate-limit createRateLimiter({ windowMs, max }).check(key, nowMs?) → { allowed, limit, remaining, resetAt } — fixed-window, in-process limiter for single-instance APIs, dev, and tests; first guard on partner routes before @eristack/api-key. Per-process counters: implement the same RateLimiter contract over Redis for multi-instance production.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rate-limit#rate-limit-core"
        }
      ]
    },
    {
      "name": "@eristack/rbac",
      "version": "0.2.3",
      "description": "Role-based access control for Eristack: subjects, roles, and boolean permissions",
      "slug": "rbac",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "rbac-adapters",
          "name": "rbac-adapters",
          "packageName": "@eristack/rbac",
          "description": "@eristack/rbac adapters: drizzle createRbacTables + createDrizzleRbacStore (pgsql/mysql/sqlite), express createRequirePermission, nest RbacModule + RbacGuard + RequirePermission, react useCan. Use when wiring RBAC persistence or HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-adapters"
        },
        {
          "id": "rbac-core",
          "name": "rbac-core",
          "packageName": "@eristack/rbac",
          "description": "Pure @eristack/rbac: createRbac, definePermission, defineRole, assignRole, grantPermission, can/canAny/canAll/authorize — boolean role-based permissions hanging off app subjects. Use for who-can-do-what without attributes or document policies.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-core"
        }
      ]
    },
    {
      "name": "@eristack/rest",
      "version": "0.1.3",
      "description": "Declarative REST route definitions with Express and Nest mounting and OpenAPI 3.1 emit",
      "slug": "rest",
      "adapters": [
        "express",
        "nest"
      ],
      "skills": [
        {
          "id": "rest-core",
          "name": "rest-core",
          "packageName": "@eristack/rest",
          "description": "@eristack/rest declarative route table: defineRoutes([{ method, path \"/orders/:id\", handler(ctx { params, query, body, headers }) → { status, body?, headers? }, summary, tags }]) → router.dispatch() for tests; mountExpressRest / createExpressRestMiddleware (Express 5, unmatched → next) / createExpressRestRouter (Express 4); RestModule.forRoutes (Nest catch-all, 404 JSON); toOpenApiDocument + mergeOpenApiDocuments (3.1 paths only). First-match, :param only, no middleware — auth/logging/idempotency mount before it. Prefer @eristack/opinion for ERP docs.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rest#rest-core"
        }
      ]
    },
    {
      "name": "@eristack/rounding-policy",
      "version": "0.1.0",
      "description": "Named rounding profiles that resolve to @eristack/money Rounding operators",
      "slug": "rounding-policy",
      "adapters": [],
      "skills": [
        {
          "id": "rounding-policy-core",
          "name": "rounding-policy-core",
          "packageName": "@eristack/rounding-policy",
          "description": "@eristack/rounding-policy createRoundingPolicyRegistry → roundingFor({ policyId, currency }) resolves named company rounding rules (invoice, tax, payroll) with per-currency overrides to @eristack/money Rounding operators. Use to round once at posting instead of scale/mode literals in services. Math stays in money; qups/tax outputs are unrounded until this is applied.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rounding-policy#rounding-policy-core"
        }
      ]
    },
    {
      "name": "@eristack/spreadsheet-operator",
      "version": "0.1.0",
      "description": "Headless spreadsheet keyboard operator — active-grid scope, cell navigation, Excel-like Enter/Tab editing",
      "slug": "spreadsheet-operator",
      "adapters": [
        "react"
      ],
      "skills": [
        {
          "id": "spreadsheet-operator-adapters",
          "name": "spreadsheet-operator-adapters",
          "packageName": "@eristack/spreadsheet-operator",
          "description": "@eristack/spreadsheet-operator/react: SpreadsheetScopeProvider { config, onCommit({ gridId, address, fieldKey, value }), deactivateOnOutsidePointerDown } (window keydown + outside click deactivate), SpreadsheetTable { descriptor } (role grid), SpreadsheetNavCell { address } (role gridcell, data-active / data-editing / aria-selected, roving tabIndex), SpreadsheetTextCell { address, value, onCommit }, useSpreadsheetGrid + SpreadsheetGridIdProvider for div grids, useSpreadsheetCellEditor({ address, readValue, writeValue, onCommit, onCancel }) to bridge form-ui MoneyInput or a Select. Style via data-spreadsheet-active / data-active; no CSS ships. Use when wiring keyboard grids in React ERP screens.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-adapters"
        },
        {
          "id": "spreadsheet-operator-core",
          "name": "spreadsheet-operator-core",
          "packageName": "@eristack/spreadsheet-operator",
          "description": "@eristack/spreadsheet-operator headless Excel-like keyboard machine: createSpreadsheetOperator(config) with registerGrid({ id, rowCount, colCount, cellAt → { kind editable|select|display|readonly, fieldKey } }), dispatch/handleKeyDown, state inactive → active → editing, effects startEdit/commit { fieldKey }/cancel, getNextEditableAddress. Defaults: Tab wraps, arrows stop at edges, Enter edits then commits and moves down, type-to-edit, arrows in edit move the caret. Use for in-browser grids with one active grid per scope; commit → qups patchLine in the app. Not xlsx export (spreadsheet-render) and not HTTP lists (data-grid).",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-core"
        }
      ]
    },
    {
      "name": "@eristack/spreadsheet-render",
      "version": "0.1.0",
      "description": "Declarative workbook model and xlsx/csv render drivers — ExcelJS/SheetJS in app or adapter",
      "slug": "spreadsheet-render",
      "adapters": [],
      "skills": [
        {
          "id": "spreadsheet-render-core",
          "name": "spreadsheet-render-core",
          "packageName": "@eristack/spreadsheet-render",
          "description": "@eristack/spreadsheet-render workbookFromRows(sheet, columns, string[][]) → SpreadsheetWorkbook; createSpreadsheetRenderer(driver).renderWorkbook(wb, \"csv\" | \"xlsx\") → { bytes, contentType }. Stub driver emits real RFC 4180 CSV (xlsx is a marker); wrap ExcelJS/SheetJS behind the same SpreadsheetRenderDriver for .xlsx. Use for data-grid \"Export\" and report downloads; cells stay strings (money amounts, IDs). Output only — not import, not PDF.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-render#spreadsheet-render-core"
        }
      ]
    },
    {
      "name": "@eristack/stock-movement",
      "version": "0.1.4",
      "description": "Inventory quantity ledger on hash-chained-ledger: locationId, lotId, composable locations, snapshots, tamper checks",
      "slug": "stock-movement",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "stock-movement-adapters",
          "name": "stock-movement-adapters",
          "packageName": "@eristack/stock-movement",
          "description": "@eristack/stock-movement/drizzle: re-exports createHashChainedLedgerTables + createDrizzleLedgerStore for Postgres on Vercel. Use as the app default store.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-adapters"
        },
        {
          "id": "stock-movement-core",
          "name": "stock-movement-core",
          "packageName": "@eristack/stock-movement",
          "description": "@eristack/stock-movement: locationIdFromParts, createStockMovement append/snapshot/verify on hash-chained qty ledger (lotId, optional ownerId). Default store is Drizzle — never createMemoryLedgerStore in apps.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-core"
        }
      ]
    },
    {
      "name": "@eristack/tax",
      "version": "0.1.0",
      "description": "Tax code registry and effective-dated rates — math via @eristack/money Tax ops",
      "slug": "tax",
      "adapters": [],
      "skills": [
        {
          "id": "tax-core",
          "name": "tax-core",
          "packageName": "@eristack/tax",
          "description": "@eristack/tax createTaxRegistry → resolveTaxRate({ code, asOf }) picks the effective-dated percent string; applyTaxToAmount(net, rate) returns the unrounded TAX PORTION via @eristack/money Tax.onExclusive. Use for invoice/order line tax with versioned statutory rates; snapshot the resolved rate on the line. Jurisdiction rules and rounding stay outside.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/tax#tax-core"
        }
      ]
    },
    {
      "name": "@eristack/timestamp",
      "version": "0.1.4",
      "description": "Business timestamps: UTC instants for facts, wall-clock for schedules (DST-safe)",
      "slug": "timestamp",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "react/fields",
        "rest",
        "zod"
      ],
      "skills": [
        {
          "id": "timestamp-adapters",
          "name": "timestamp-adapters",
          "packageName": "@eristack/timestamp",
          "description": "@eristack/timestamp adapters (mirror money): Drizzle SQL columns, REST wire codec, Zod 4, Express/Nest HTTP, client revive, React form helpers. Use when persisting instants or wall times in SQL or validating API bodies.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-adapters"
        },
        {
          "id": "timestamp-core",
          "name": "timestamp-core",
          "packageName": "@eristack/timestamp",
          "description": "Business timestamps with @eristack/timestamp: instant mode (UTC facts + IANA zone for local dates) and wall mode (local intent, DST-safe schedules). Use for transaction_date, posted_at, due_at, appointments — not raw Date timezone math.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-core"
        }
      ]
    },
    {
      "name": "@eristack/unlocode",
      "version": "0.1.0",
      "description": "UN/LOCODE port and place codes — normalize five-character locodes with ISO 3166 country validation",
      "slug": "unlocode",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "unlocode-core",
          "name": "unlocode-core",
          "packageName": "@eristack/unlocode",
          "description": "@eristack/unlocode UN/LOCODE normalization for ports and trade locations. Depends on @eristack/iso-3166 for country prefix. Use for B/L, forwarding, and logistics locode fields — not for tenant port masters or full UN datasets.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/unlocode#unlocode-core"
        }
      ]
    },
    {
      "name": "@eristack/uom",
      "version": "0.1.1",
      "description": "Unit of measure quantities with fixed-ratio conversion — string decimal amounts, no silent float math",
      "slug": "uom",
      "adapters": [
        "zod"
      ],
      "skills": [
        {
          "id": "uom-core",
          "name": "uom-core",
          "packageName": "@eristack/uom",
          "description": "@eristack/uom fixed-ratio unit conversion with string decimal amounts — kg/g/L/pcs and custom units. Use for inventory qty before qups or stock-movement, not float math.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/uom#uom-core"
        }
      ]
    },
    {
      "name": "@eristack/valuations",
      "version": "0.2.5",
      "description": "Product/lot cost valuation: FIFO, LIFO, FEFO, moving/weighted average, standard cost, specific ID, HIFO/LOFO — with hash-chained cost ledger",
      "slug": "valuations",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "valuations-adapters",
          "name": "valuations-adapters",
          "packageName": "@eristack/valuations",
          "description": "@eristack/valuations/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore + createValuationLayerTables + createDrizzleLayerStore. Both stores required for production engines on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-adapters"
        },
        {
          "id": "valuations-core",
          "name": "valuations-core",
          "packageName": "@eristack/valuations",
          "description": "@eristack/valuations: FIFO/LIFO/FEFO/HIFO/LOFO/movingAverage/weightedAverage/ standardCost/specificIdentification with dual qty/value hash chains. Default stores are Drizzle ledger + Drizzle layers — memory is tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-core"
        }
      ]
    },
    {
      "name": "@eristack/vercel-adapters",
      "version": "0.1.0",
      "description": "Serverless-friendly Express entry helpers for Vercel — no Vercel SDK in core",
      "slug": "vercel-adapters",
      "adapters": [],
      "skills": [
        {
          "id": "vercel-adapters-core",
          "name": "vercel-adapters-core",
          "packageName": "@eristack/vercel-adapters",
          "description": "@eristack/vercel-adapters createVercelExpressHandler(app) as the single Vercel Node function default export + defaultVercelDeployNotes (60s maxDuration, ~4.5MB body, singleton/lazy-pool cold-start rules). Use when deploying an Express + Drizzle Eristack API to Vercel: one rewrite to the function, module-scope app and pool, outbox via cron route, uploads via presigned S3. No Vercel SDK.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/vercel-adapters#vercel-adapters-core"
        }
      ]
    }
  ]
} as KnowledgeCatalog;
