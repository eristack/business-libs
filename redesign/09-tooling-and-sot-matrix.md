# Tooling and source-of-truth matrix (draft)

| Concern | SoT | Tooling | CI check |
| --- | --- | --- | --- |
| Dependencies | `pnpm-lock.yaml` | pnpm 10.14 | lockfile |
| Build graph | turbo + `package.json` | `pnpm build` | build |
| Types | tsconfig per package | turbo typecheck | typecheck |
| Unit tests | vitest/jest per package | turbo test | test |
| Drizzle integration | `scripts/run-integration-tests.mjs` | harness | integration |
| Export maps | `package.json` exports | `check-package-exports.mjs` | exports |
| Release notes | `.changeset/*.md` | changesets | changesets |
| npm publish hygiene | peerDeps rules | `check-publish-deps.mjs` | publish |
| Package graph budget | debottleneck config | `package-debottleneck-check.mjs` | debottleneck |
| Intent skills | `skills/**/SKILL.md` | `skills-validate.mjs`, intent CLI | skills |
| AI catalog | recipes + package.json | `sync-catalog.mjs` | knowledge |
| Doc nav | package docs frontmatter | `docs-check.mjs`, `docs-sync.mjs` | docs |
| Ticket subscriptions | `ticket.yaml` per package | `ticket-triage.mjs` | ticket |
| Web a11y tokens | design-system vars | `check-brand-contrast.mjs` | contrast |
| Features layer policy | `packages/features/` | `check-features-layer.mjs` | features |
| PR CI scope | git diff vs main | `pnpm eristack ci --base origin/main` | GitHub Actions |
| Agent plan | check registry | `pnpm eristack plan --json` | — |
| Stabilization program | **`redesign/tasks.yaml`** | human/agent | — |

## GitHub vs local

| Action | GitHub | Local |
| --- | --- | --- |
| PR validation | `ci.yml` affected eristack ci | `pnpm prepush` / `pnpm ci:pr` |
| Main | `check --profile pr` | same |
| Skills only PR | `check-skills.yml` | `pnpm exec intent validate` |
| Release | `release.yml` + Changesets bot | human |

## MCP (optional)

| Server | Scope |
| --- | --- |
| `@eristack/ai-dev` MCP | dev_plan, dev_check in consumer repos |
| `@eristack/ai-workflow` | backlog/FTS — not required in business-libs |

## Gaps (proposed)

- No CI step validates `.cursor/rules` against skills
- No dashboard for package maturity (audit was manual)
- Origin/GitHub dual remotes — human policy; not in matrix SoT
