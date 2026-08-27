import { catalog } from "./generated/catalog.js";
import { localSkills } from "./generated/local-skills.js";
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
        score += token === trigger ? 4 : 2;
        score += Math.min(trigger.length, 24) / 24;
      }
    }
  }

  if (matchedTriggers.length === 0) return null;

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

  const seen = new Set<string>();
  const unmatchedUnique = unmatched.filter((token) => {
    if (seen.has(token)) return false;
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

function parseSkillRef(ref: string): { packageName: string; skillId: string } | null {
  const hash = ref.indexOf("#");
  if (hash <= 0) return null;
  return {
    packageName: ref.slice(0, hash),
    skillId: ref.slice(hash + 1),
  };
}

function skillMeta(packageName: string, skillId: string) {
  const pkg = catalog.packages.find((item) => item.name === packageName);
  const skill = pkg?.skills.find((item) => item.id === skillId);
  if (skill) return skill;

  const local = localSkills.find(
    (item) => item.packageName === packageName && item.id === skillId,
  );
  return local ?? null;
}

function appendStep(
  steps: LoadPlanStep[],
  indexByKey: Map<string, number>,
  input: {
    packageName: string;
    skillId: string;
    recipeId: string;
    reason: string;
  },
) {
  const key = `${input.packageName}#${input.skillId}`;
  const existing = indexByKey.get(key);
  if (existing !== undefined) {
    const step = steps[existing]!;
    if (!step.recipeIds.includes(input.recipeId)) {
      step.recipeIds.push(input.recipeId);
    }
    return;
  }

  const meta = skillMeta(input.packageName, input.skillId);
  const step: LoadPlanStep = {
    packageName: input.packageName,
    skillId: input.skillId,
    loadCommand:
      meta?.loadCommand ??
      `pnpm dlx @tanstack/intent@latest load ${input.packageName}#${input.skillId}`,
    recipeIds: [input.recipeId],
    reason: input.reason,
  };
  indexByKey.set(key, steps.length);
  steps.push(step);
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
    const recipe = match.recipe;

    for (const ref of recipe.canonicalSkills ?? []) {
      const parsed = parseSkillRef(ref);
      if (!parsed) continue;
      appendStep(steps, indexByKey, {
        packageName: parsed.packageName,
        skillId: parsed.skillId,
        recipeId: recipe.id,
        reason: recipe.rationale,
      });
    }

    for (const ref of recipe.packages) {
      for (const skillId of ref.skills) {
        appendStep(steps, indexByKey, {
          packageName: ref.name,
          skillId,
          recipeId: recipe.id,
          reason: recipe.rationale,
        });
      }
    }
  }

  return {
    input: result.input,
    steps,
    unmatched: result.unmatched,
  };
}
