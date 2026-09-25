# Changeset sync after `main` Version Packages release

Use when a long-lived branch still has many `.changeset/*.md` files but **`main` already merged “Version packages”** (npm publish).

## Symptoms

- `origin/main` has **no** pending `*.md` under `.changeset/` (only `config.json` + `README.md`).
- Your branch still has **one file per package** from the same release batch.
- `package.json` versions on the branch are **one patch behind** `origin/main` for many `@eristack/*` packages.
- `pnpm changeset status` warns packages changed with **no changesets**, or would **double-bump** if old files remain.

## Safe sequence

```bash
git fetch origin main
git merge origin/main   # or rebase; prefer merge to preserve branch history
```

1. **Accept deletion** of stale `.changeset/*.md` from `main` (they were consumed by the Version Packages PR).
2. Resolve conflicts:
   - **`packages/**/package.json` + `CHANGELOG.md`** — keep **main’s version numbers** and changelog entries; re-apply your branch code changes if needed.
   - **`src/generated/*`** — run `pnpm knowledge:sync` and stage generated files (do not hand-merge catalog).
3. Confirm no pending release files from the old batch:

   ```bash
   ls .changeset/*.md   # should be README only, before you add new changesets
   ```

4. Add **new** changesets only for commits **after** the release (one package per file):

   ```bash
   pnpm changeset
   ```

5. Fix peer ranges if `pnpm changeset status` warns `must depend on the current version` (match workspace semver, e.g. `^0.1.0` for `@eristack/epoch@0.1.x`).

6. `pnpm install --lockfile-only` if merge touched `package.json` / peers.

7. `pnpm changesets:check` · `pnpm changeset status` · `pnpm eristack check --profile pr --skip-build`

8. Commit the merge (human-owned VCS).

## Quick diff vs main

```bash
node -e "
const {execSync}=require('child_process');
const fs=require('fs');
const path=require('path');
function walk(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,o);else if(e.name==='package.json')o.push(p);}return o;}
function v(r,p){try{return JSON.parse(execSync('git show '+r+':'+p,{encoding:'utf8'})).version}catch{return null}}
for(const p of walk('packages')){
  const j=JSON.parse(fs.readFileSync(p,'utf8'));
  if(!j.name?.startsWith('@eristack/')||j.private) continue;
  const m=v('origin/main',p.replace(/\\\\/g,'/'));
  if(m&&m!==j.version) console.log(j.name,'local',j.version,'main',m);
}
"
```

When **local === main** for all packages and only **new** changesets exist, the branch is aligned with the release.
