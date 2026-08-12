import { catalog } from "./generated/catalog.js";
import { recipes } from "./generated/recipes.js";
import type {
  KnowledgeCatalog,
  LoadPlan,
  LoadPlanStep,
  RecommendationMatch,
  RecommendationResult,
  Recipe,
} from "./types.js";

function normalizeInput(input: string | string[]): string[] {
  const parts = Array.isArray(input) ? input : [input];
  return parts
    .flatMap((part) => part.split(/[,;/|]+/))
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function scoreRecipe(recipe: Recipe, tokens: string[]): RecommendationMatch | null {
  const matchedTriggers: string[] = [];
  let score = 0;

  for (const trigger of recipe.triggers) {
    for (const token of tokens) {
      if (token === trigger || token.includes(trigger) || trigger.includes(token)) {
        if (!matchedTriggers.includes(trigger)) matchedTriggers.push(trigger);
        // Prefer exact / longer trigger hits
        score += token === trigger ? 4 : 2;
        score += Math.min(trigger.length, 24) / 24;
      }
    }
  }

  if (matchedTriggers.length === 0) return null;

  // Lower priority number = earlier in product routing (erp-app-core = 5)
  score += Math.max(0, 40 - recipe.priority);

  return { recipe, score, matchedTriggers };
}

export function getCatalog(): KnowledgeCatalog {
  return catalog;
}

export function listPackages() {
  return catalog.packages.map(({ skills: _skills, ...pkg }) => pkg);
}

export function listSkills() {
  return catalog.packages.flatMap((pkg) => pkg.skills);
}

export function listRecipes(): Recipe[] {
  return recipes;
}

export function recommend(input: string | string[]): RecommendationResult {
  const tokens = normalizeInput(input);
  const matches = recipes
    .map((recipe) => scoreRecipe(recipe, tokens))
    .filter((match): match is RecommendationMatch => match !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.recipe.priority !== b.recipe.priority) {
        return a.recipe.priority - b.recipe.priority;
      }
      return a.recipe.id.localeCompare(b.recipe.id);
    });

  const covered = new Set(
    matches.flatMap((match) => match.matchedTriggers),
  );
  const unmatched = tokens.filter((token) => {
    return !matches.some((match) =>
      match.matchedTriggers.some(
        (trigger) =>
          token === trigger || token.includes(trigger) || trigger.includes(token),
      ),
    );
  });

  // Deduplicate unmatched while preserving order
  const seen = new Set<string>();
  const unmatchedUnique = unmatched.filter((token) => {
    if (seen.has(token)) return false;
    // If any trigger covered this token loosely, drop it
    for (const trigger of covered) {
      if (token === trigger || token.includes(trigger) || trigger.includes(token)) {
        return false;
      }
    }
    seen.add(token);
    return true;
  });

  return {
    input: tokens,
    matches,
    unmatched: unmatchedUnique,
    fallbackNote:
      matches.length === 0
        ? "No Eristack package matched. Build with app code or other libraries; do not invent a fake @eristack package."
        : unmatchedUnique.length > 0
          ? "Some goals had no Eristack recipe. Keep matched @eristack packages first; implement unmatched goals in app code."
          : null,
  };
}

function skillMeta(packageName: string, skillId: string) {
  const pkg = catalog.packages.find((item) => item.name === packageName);
  const skill = pkg?.skills.find((item) => item.id === skillId);
  return skill ?? null;
}

export function loadPlan(
  input: string | string[] | RecommendationResult,
): LoadPlan {
  const result =
    typeof input === "object" && input !== null && "matches" in input
      ? input
      : recommend(input);

  const steps: LoadPlanStep[] = [];
  const indexByKey = new Map<string, number>();

  for (const match of result.matches) {
    for (const ref of match.recipe.packages) {
      for (const skillId of ref.skills) {
        const key = `${ref.name}#${skillId}`;
        const existing = indexByKey.get(key);
        if (existing !== undefined) {
          const step = steps[existing]!;
          if (!step.recipeIds.includes(match.recipe.id)) {
            step.recipeIds.push(match.recipe.id);
          }
          continue;
        }

        const meta = skillMeta(ref.name, skillId);
        const step: LoadPlanStep = {
          packageName: ref.name,
          skillId,
          loadCommand:
            meta?.loadCommand ??
            `pnpm dlx @tanstack/intent@latest load ${ref.name}#${skillId}`,
          recipeIds: [match.recipe.id],
          reason: match.recipe.rationale,
        };
        indexByKey.set(key, steps.length);
        steps.push(step);
      }
    }
  }

  return {
    input: result.input,
    steps,
    unmatched: result.unmatched,
  };
}
