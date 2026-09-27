# Gotchas

## v4 UUIDs

`parseEntityId` **rejects** UUID v4. Migrate legacy rows in the app before enforcing on APIs.

## Hyphenless input

Compact 32-hex input is accepted; storage should still use canonical hyphenated lowercase from `parseEntityId`.

## Sort vs `created_at`

v7 ids sort by generation time; backdated rows need an explicit `created_at` if business order differs.

## Randomness

`generateEntityId` uses `crypto.getRandomValues`. Provide a CSPRNG in runtime (Node 19+, modern browsers, Edge).
