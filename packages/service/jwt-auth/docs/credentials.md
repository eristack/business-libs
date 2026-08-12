---
title: Credentials
description: Register, log in, change passwords, and disable logins with scrypt-hashed credentials
sidebar_position: 4
---

# Credentials

Username and password support is **optional**. Pass a `credentials` store and you get three methods; omit it and `login`, `registerCredentials`, and `changePassword` throw `ConfigurationError` while the rest of the package works exactly as before.

```ts
const auth = createJwtAuth({
  accessSecret: appConfig.jwtAccessSecret,
  store: refreshTokenStore,
  credentials: credentialStore, // ← unlocks password login
});
```

> **Credentials are a child of your users table.** `subject` is your application's user id. There is no `createUser` here, and the default table name is `jwt_auth_credentials` — never `users`. See [Concepts](./concepts.md#users-vs-credentials-vs-refresh-families).

## The credential record

```ts
interface CredentialRecord {
  id: string;
  subject: string;        // your user id — unique, one credential per user
  username: string;       // unique, stored trimmed + lowercased
  passwordHash: string;   // scrypt, never plaintext
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date | null;
}
```

Both `subject` and `username` are unique. That gives you two hard guarantees: a username identifies exactly one user, and a user has at most one password login.

## Registering credentials

Signup is two steps, and the order matters: **your** user row first, then the credential.

```ts
await db.transaction(async (tx) => {
  await tx.insert(users).values({
    id: userId,
    displayName: input.displayName,
    email: input.email,
    createdAt: new Date(),
  });
});

await auth.registerCredentials({
  subject: userId,
  username: input.email,
  password: input.password,
});
```

What `registerCredentials` does, in order:

1. Requires a `credentials` store → otherwise `ConfigurationError`
2. Requires non-empty `subject`, `username`, `password` → otherwise `ConfigurationError`
3. Requires `password.length >= 8` → otherwise `ConfigurationError`
4. Normalizes the username: `username.trim().toLowerCase()`
5. Rejects a taken username → `UsernameTakenError`
6. Rejects a subject that already has credentials → `ConfigurationError` ("use changePassword instead")
7. Hashes with scrypt and saves with `disabledAt: null`

It returns `void`. It does **not** issue tokens — call `login` (or `issueTokens`) afterwards if you want the user signed in immediately.

### Username normalization

`"  Ada@Example.com "` and `"ada@example.com"` are the same login. Normalization happens on both write and read, so the lookup in `login` matches what `registerCredentials` stored.

| You pass | Stored / looked up as |
| --- | --- |
| `"Ada"` | `"ada"` |
| `" ada "` | `"ada"` |
| `"ADA@EXAMPLE.COM"` | `"ada@example.com"` |

> Case-insensitivity is enforced by the library, not by your database collation. If you write to the credentials table directly (a seed script, a data migration), lowercase the username yourself or `login` will never find the row.

### Password rules

The only rule the library enforces is a minimum of **8 characters**, on both `registerCredentials` and `changePassword`. Violations throw `ConfigurationError`, which HTTP adapters surface as `400`.

Everything else is product policy and belongs in your validation layer, before you call this package: breach-list checks, entropy requirements, disallowed reuse, maximum length. Validate there so you can return field-level messages your UI can render.

### One credential per subject

If a subject already has a row, `registerCredentials` refuses:

```ts
// ConfigurationError: credentials already exist for this subject; use changePassword instead
```

Catch it explicitly in idempotent code paths like seeds:

```ts
import { ConfigurationError, UsernameTakenError } from "@eristack/jwt-auth";

try {
  await auth.registerCredentials({ subject: "user_1", username: "demo", password: "password123" });
} catch (error) {
  const alreadySetUp =
    error instanceof UsernameTakenError ||
    (error instanceof ConfigurationError &&
      error.message.includes("credentials already exist"));
  if (!alreadySetUp) throw error;
}
```

That is exactly the pattern `examples/express` uses to seed its demo user.

Need multiple logins per user (a second email, say)? That is a product decision this package intentionally leaves to you: model the extra identities in your own schema and call `issueTokens` after verifying them.

## Logging in

```ts
const tokens = await auth.login({
  username: "ada@example.com",
  password: input.password,
  claims: { role: user.role, tenantId: user.tenantId }, // optional
});
```

Steps:

1. Requires a `credentials` store → `ConfigurationError`
2. Missing username or password → `InvalidCredentialsError`
3. Look up by normalized username; missing **or** `disabledAt` set → `InvalidCredentialsError`
4. Verify the password in constant time; mismatch → `InvalidCredentialsError`
5. Issue a new token pair via `issueTokens({ subject: record.subject, claims })` — a **new family**

> **Every failure is the same error.** Unknown username, wrong password, and disabled account all raise `InvalidCredentialsError` with the same message, so responses cannot be used to enumerate accounts. Keep that property in your own error handling: do not add "no such user" branches on top.

### Claims at login

`claims` are yours to supply and are merged into the access token. The library never reads your users table, so if you want `role` or `tenantId` in the token you must load and pass them:

```ts
const record = await db.query.users.findFirst({ where: eq(users.email, input.username) });
const tokens = await auth.login({
  username: input.username,
  password: input.password,
  claims: { role: record.role },
});
```

These claims are also persisted with the refresh record and replayed on every rotation — see [Tokens & refresh](./tokens-and-refresh.md#claims-across-refresh) for the staleness trade-off.

> The REST `POST /auth/login` route forwards `body.claims` straight to `login`. That means an unauthenticated client could ask for `{ "claims": { "role": "admin" } }`. If your authorization reads claims, strip or override them server-side — see [Security](./security.md#never-trust-client-supplied-claims).

## Changing a password

```ts
await auth.changePassword({
  subject: verified.subject,     // from a verified access token
  currentPassword: body.currentPassword,
  newPassword: body.newPassword,
});
```

Steps:

1. Requires a `credentials` store → `ConfigurationError`
2. All three fields required → `ConfigurationError`
3. `newPassword.length >= 8` → otherwise `ConfigurationError`
4. Credential missing or disabled → `CredentialNotFoundError`
5. `currentPassword` mismatch → `InvalidCredentialsError`
6. Writes the new scrypt hash and bumps `updatedAt`

Note that it is keyed by `subject`, not by username: the caller must already be authenticated. The REST action enforces this by requiring `Authorization: Bearer …` and deriving `subject` from the verified token, so a user can never change someone else's password.

> **Changing a password does not revoke sessions.** Existing refresh families stay alive and every other device stays logged in. This is a deliberate choice — the password is one authentication factor, not the session store — but it is almost never what a user expects after "change my password because I think someone has access".
>
> If you want the common product behaviour, revoke explicitly:
>
> ```ts
> await auth.changePassword({ subject, currentPassword, newPassword });
> await auth.revokeAllForSubject(subject);   // sign out everywhere, including here
> const fresh = await auth.issueTokens({ subject });  // then re-issue for this device
> ```
>
> Do this in your own handler; the built-in `POST /auth/change-password` route only changes the password. See [Security](./security.md#change-password-does-not-revoke-sessions).

## Password hashing

Hashing is scrypt from Node's `crypto`, with parameters encoded into the stored string so they can evolve without a migration.

| Parameter | Value |
| --- | --- |
| KDF | scrypt |
| `N` (cost) | 16384 |
| `r` (block size) | 8 |
| `p` (parallelism) | 1 |
| Derived key length | 64 bytes |
| Salt | 16 random bytes per password |
| Encoding | `scrypt$N$r$p$salt$hash`, salt and hash base64url |

Verification parses the parameters out of the stored string, re-derives with the same salt, and compares with `timingSafeEqual`. A malformed or non-scrypt hash simply returns `false` rather than throwing, so a corrupted row fails closed as a bad password.

The helpers are exported if you need them outside the credential flow — importing a legacy user table, for example:

```ts
import { hashPassword, verifyPassword } from "@eristack/jwt-auth";

const hash = await hashPassword("correct horse battery");
const ok = await verifyPassword("correct horse battery", hash);
```

Because scrypt is deliberately slow (tens of milliseconds per call), both `login` and `registerCredentials` are async and CPU-bound. Rate-limit your login route: it is a convenient CPU amplifier for an attacker.

## Disabling a login

Setting `disabledAt` makes `login` and `changePassword` fail as if the credential did not exist. Core exposes no `disableCredentials` method — call the store port directly, which keeps administrative actions in your admin layer:

```ts
const record = await credentialStore.findBySubject(userId);
if (record) {
  await credentialStore.disable(record.id, new Date());
}
```

Disabling stops *new* logins. It does **not** revoke existing sessions, for the same reason `changePassword` does not. Suspending a user is usually both:

```ts
await credentialStore.disable(record.id, new Date());
await auth.revokeAllForSubject(userId);
```

There is no `enable` on the port. If you need reversible suspensions, clear `disabledAt` with your own Drizzle update against the credentials table.

## Password reset

Deliberately out of scope: reset requires email or SMS delivery, single-use tokens, and product-specific expiry — infrastructure this package refuses to own. Compose it from parts you already have:

1. Verify the reset link with **your** one-time token (your table, your mailer)
2. Look up the credential with `findBySubject`
3. Write a new hash with `updatePasswordHash(record.id, await hashPassword(newPassword), new Date())`
4. Call `revokeAllForSubject(subject)` — after a reset you almost certainly do want every session dead
5. Issue a fresh pair with `issueTokens({ subject })` if the flow signs the user straight in

## Error reference

| Situation | Error | HTTP via adapters |
| --- | --- | --- |
| No `credentials` store configured | `ConfigurationError` | `400` |
| Missing `subject` / `username` / `password` | `ConfigurationError` | `400` |
| Password shorter than 8 characters | `ConfigurationError` | `400` |
| Username already registered | `UsernameTakenError` | `409` |
| Subject already has credentials | `ConfigurationError` | `400` |
| Unknown username, wrong password, or disabled | `InvalidCredentialsError` | `401` |
| `changePassword` with no live credential | `CredentialNotFoundError` | `400` |

## Next steps

- [Tokens & refresh](./tokens-and-refresh.md) — what `login` hands back and how it rotates
- [HTTP adapters](./http.md) — `POST /auth/login`, `POST /auth/change-password`
- [Database](./database.md) — the credentials table and its foreign key to `users`
- [Security](./security.md) — claims, rate limits, revocation policy
