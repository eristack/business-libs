import fs from "node:fs";
import path from "node:path";
import {
  assessFeasibility,
  checkSubscriptions,
  createBugTicket,
  createSuggestionTicket,
  defaultSubscriptionForPackage,
  findPackageDir,
  findRepoRoot,
  listEristackPackageDirs,
  loadSubscription,
  renderTicketMarkdown,
  validateTicket,
  writeSubscription,
  writeTicketFile,
} from "./index.js";
import type { BugTicketInput, SuggestionTicketInput } from "./types.js";

function usage(): never {
  console.error(`Usage:
  eristack-ticket check
  eristack-ticket subscribe --all
  eristack-ticket subscribe --package @eristack/<name>
  eristack-ticket bug --package @eristack/<name> --title "..." --summary "..." [options]
  eristack-ticket suggest --package @eristack/<name> --title "..." --summary "..." [options]
  eristack-ticket render --from-json <file>

Bug options:
  --version <semver>  --expected <text>  --actual <text>
  --scenario <text>   --logs <text|@file>  --reporter <name>
  --fix-plan <step> (repeatable)  --step <repro step> (repeatable)
  --out <dir>         (default: .eristack/tickets)

Suggest options:
  --user-story <text>  --behavior <text>  --api <text>
  --sketch <step> (repeatable)  --reporter <name>  --out <dir>
`);
  process.exit(1);
}

function flagValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx < 0) return undefined;
  return args[idx + 1];
}

function flagValues(args: string[], name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === name && args[i + 1]) {
      out.push(args[i + 1]!);
      i++;
    }
  }
  return out;
}

function readMaybeFile(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("@")) {
    return fs.readFileSync(path.resolve(value.slice(1)), "utf8");
  }
  return value;
}

function printCheck(repoRoot: string): void {
  const result = checkSubscriptions(repoRoot);
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        checked: result.checked,
        missing: result.missing,
        invalid: result.invalid,
      },
      null,
      2,
    ),
  );
  if (!result.ok) process.exitCode = 1;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) usage();

  const cwd = process.cwd();
  let repoRoot: string;
  try {
    repoRoot = findRepoRoot(cwd);
  } catch {
    repoRoot = cwd;
  }

  if (cmd === "check") {
    printCheck(repoRoot);
    return;
  }

  if (cmd === "subscribe") {
    const all = rest.includes("--all");
    const packageName = flagValue(rest, "--package");
    if (!all && !packageName) usage();

    const targets = all
      ? listEristackPackageDirs(repoRoot)
      : (() => {
          const dir = findPackageDir(repoRoot, packageName!);
          if (!dir) {
            console.error(`Package not found: ${packageName}`);
            process.exitCode = 1;
            return [];
          }
          const pkgJson = JSON.parse(
            fs.readFileSync(path.join(dir, "package.json"), "utf8"),
          );
          return [
            {
              name: packageName!,
              dir,
              category: "",
              slug: "",
              description: pkgJson.description,
            },
          ];
        })();

    for (const pkg of targets) {
      const existing = fs.existsSync(path.join(pkg.dir, "ticket.yaml"));
      if (existing && !rest.includes("--force")) {
        console.log(`skip ${pkg.name} (ticket.yaml exists)`);
        continue;
      }
      const skillsDir = path.join(pkg.dir, "skills");
      const skills = fs.existsSync(skillsDir)
        ? fs
            .readdirSync(skillsDir, { withFileTypes: true })
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
        : [];
      const file = writeSubscription(
        pkg.dir,
        defaultSubscriptionForPackage({
          name: pkg.name,
          description: pkg.description,
          skills,
        }),
      );
      console.log(`wrote ${path.relative(repoRoot, file)}`);
    }
    return;
  }

  if (cmd === "bug" || cmd === "suggest") {
    const packageName = flagValue(rest, "--package");
    const title = flagValue(rest, "--title");
    const summary = flagValue(rest, "--summary");
    if (!packageName || !title || !summary) usage();

    const outDir = flagValue(rest, "--out");
    const reporter = flagValue(rest, "--reporter");

    const pkgDir = findPackageDir(repoRoot, packageName);
    const subscription = pkgDir ? loadSubscription(pkgDir) : null;

    if (cmd === "bug") {
      const input: BugTicketInput = {
        package: packageName,
        title,
        summary,
        version: flagValue(rest, "--version"),
        expected: flagValue(rest, "--expected"),
        actual: flagValue(rest, "--actual"),
        scenario: flagValue(rest, "--scenario"),
        logs: readMaybeFile(flagValue(rest, "--logs")),
        stepsToReproduce: flagValues(rest, "--step"),
        fixPlan: flagValues(rest, "--fix-plan"),
        reporter,
      };
      const ticket = createBugTicket(input);
      const validation = validateTicket(ticket);
      const file = writeTicketFile(cwd, ticket, { ticketsDir: outDir });
      console.log(
        JSON.stringify(
          {
            path: file,
            id: ticket.id,
            validation,
            previewChars: renderTicketMarkdown(ticket).length,
          },
          null,
          2,
        ),
      );
      return;
    }

    const input: SuggestionTicketInput = {
      package: packageName,
      title,
      summary,
      userStory: flagValue(rest, "--user-story"),
      proposedBehavior: flagValue(rest, "--behavior"),
      proposedApi: flagValue(rest, "--api"),
      implementationSketch: flagValues(rest, "--sketch"),
      reporter,
    };
    const assessment = assessFeasibility(input, subscription);
    input.feasibility = assessment.feasibility;
    input.feasibilityRationale = assessment.rationale;
    if (!input.implementationSketch?.length) {
      input.implementationSketch = assessment.nextSteps;
    }
    const ticket = createSuggestionTicket(input);
    ticket.feasibility = assessment.feasibility;
    const validation = validateTicket(ticket);
    const file = writeTicketFile(cwd, ticket, { ticketsDir: outDir });
    console.log(
      JSON.stringify(
        {
          path: file,
          id: ticket.id,
          feasibility: assessment,
          validation,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (cmd === "render") {
    const fromJson = flagValue(rest, "--from-json");
    if (!fromJson) usage();
    const raw = JSON.parse(fs.readFileSync(path.resolve(fromJson), "utf8"));
    if (raw.kind === "bug") {
      const ticket = createBugTicket(raw.body ?? raw);
      process.stdout.write(`${renderTicketMarkdown(ticket).trimEnd()}\n`);
      return;
    }
    if (raw.kind === "suggestion") {
      const ticket = createSuggestionTicket(raw.body ?? raw);
      process.stdout.write(`${renderTicketMarkdown(ticket).trimEnd()}\n`);
      return;
    }
    console.error("JSON must include kind: bug | suggestion");
    process.exitCode = 1;
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
