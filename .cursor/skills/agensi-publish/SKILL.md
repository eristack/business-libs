---
name: agensi-publish
description: Publish or update the free "Eristack AI Knowledge Pack" listing on agensi.io through the Agensi MCP creator tools (submit_skill / update_skill), from the release-checked build of @eristack/ai-knowledge. Use when the user asks to publish, upload, or update the Eristack skills on Agensi.
disable-model-invocation: true
---

# Publish the Eristack pack to Agensi

CI builds and checks the pack on every `@eristack/ai-knowledge` release. This runbook does the last step: sending it to Agensi through the user's own Agensi connection, with one explicit "yes" from the user. Agensi has no API keys; only the creator's OAuth-connected agent can submit, and every submission is previewed, confirmed, then reviewed.

## Hard rules

- Never call the confirming/submitting step until the user has seen the preview and said yes **in this chat**.
- Pricing stays **Free**. Never set a price, subscription, or outside checkout link.
- Send only files listed in `submission.json` → `files`, read from `submission.json` → `packDir`. Never hand-edit files under `agensi-dist/`: fix the source (`skills/`, `knowledge/`, `agensi/`) and rebuild.
- Never paste OAuth tokens, cookies, or `.env` values into files, commits, or chat.
- Connecting a new Agensi client signs out every other client on that account — warn the user before they connect one.

## 1. Check the connection

Find the Agensi MCP tools (in Cursor: `GetDynamicTools` with pattern `agensi|submit_skill`). If they are missing or need auth, stop and tell the user to connect `https://mcp.agensi.io/mcp/auth` as the creator account and turn on Creator Mode. Read each tool's schema before calling it — parameter names below are descriptive, the schema wins.

## 2. Build the release payload

```bash
pnpm --filter @eristack/ai-knowledge agensi:release
```

Needs network (checks the version is on npm). On failure:

| Message | Fix |
| --- | --- |
| `… is not on npm yet` | Stop. Merge the Version Packages PR and let Release publish first. |
| `changelog: no changelog …` or `changelog: … client name` | Write `packages/ai/ai-knowledge/agensi/changelog/<version>.md`: 1–5 plain bullets for app builders, no internal names or codes. Rebuild. Commit that file. |
| Any other check | Fix the source it names, rebuild. Do not weaken the check. |

Then read `packages/ai/ai-knowledge/agensi-dist/submission.json` (`listing`, `version`, `changelog`, `packDir`, `files`, `skills`).

## 3. Decide: new listing or update

1. `creator_status` — Creator Mode must be on (Free needs no payout method).
2. `my_skills` — find the listing whose name equals `listing.name`.

| Found | Action |
| --- | --- |
| Nothing | **First publish** → step 4 with `submit_skill` |
| Live, older version | **Update** → step 4 with `update_skill` |
| Live, same `version` | Stop — already published |
| Pending review | Stop — report status; do not stack another update |
| Rejected | Show the rejection reasons, fix the source, rebuild, then update |

## 4. Send and preview

Files: every path in `files`, contents read from `<packDir>/<path>`, paths kept as-is (`README.md`, `LICENSE`, `skills/eristack-*/SKILL.md`, `knowledge/…`).

- **submit_skill** (first time): files + listing fields mapped by meaning — name, summary, description, demo ("see it in action"), compatibility, categories, tags, keywords, use cases, limitations, FAQ, docs URL; price free. Map `listing.categories` hints to real slugs from `list_categories` (max 3); if unclear, ask the user. Omit fields the schema does not take.
- **update_skill** (later releases): listing id + files + `changelog`.

Show the user, then **stop and ask**:

```text
Agensi <submit | update> — preview only, nothing published yet
Listing: Eristack AI Knowledge Pack · Free · v<version>
Skills: <n> (eristack-recommend, …) · files: <n>
Changelog: <changelog>
Preview: <link from the tool>
Reply "yes" to submit for Agensi review.
```

## 5. Confirm and finish

After "yes": confirm the preview with the tool. If `listing.logo_url` is set and the listing has no logo, call `upload_skill_media` with it. Report the listing status (normally pending review) and remind the user that text/price edits on agensi.io go live immediately, while new ZIPs go through review.

If the listing id was new, tell the user to record it in `agensi/listing.yaml` as `agensi_id` so later runs can skip the search.
