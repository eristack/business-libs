import type { ModifierKind } from "./modifier.js";

export type ModifierKindOrderRule = {
  kind: ModifierKind | string;
  /** When set, `kind` must appear after this kind in the stack. */
  after?: ModifierKind | string;
};

export class ModifierOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModifierOrderError";
  }
}

/** Detect cycles in modifier-kind ordering rules (profile config). */
export function assertAcyclicModifierOrder(
  rules: readonly ModifierKindOrderRule[],
): void {
  const afterOf = new Map<string, string | undefined>();
  for (const rule of rules) {
    afterOf.set(String(rule.kind), rule.after ? String(rule.after) : undefined);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(kind: string): void {
    if (visited.has(kind)) return;
    if (visiting.has(kind)) {
      throw new ModifierOrderError(`modifier kind order cycle at "${kind}"`);
    }
    visiting.add(kind);
    const after = afterOf.get(kind);
    if (after) visit(after);
    visiting.delete(kind);
    visited.add(kind);
  }

  for (const kind of afterOf.keys()) {
    visit(kind);
  }
}

export function validateModifierStackOrder(
  stack: readonly { kind: string }[],
  rules: readonly ModifierKindOrderRule[],
): void {
  assertAcyclicModifierOrder(rules);
  const indexByKind = new Map<string, number>();
  stack.forEach((modifier, index) => {
    indexByKind.set(modifier.kind, index);
  });
  for (const rule of rules) {
    if (!rule.after) continue;
    const idx = indexByKind.get(String(rule.kind));
    const afterIdx = indexByKind.get(String(rule.after));
    if (idx != null && afterIdx != null && idx <= afterIdx) {
      throw new ModifierOrderError(
        `modifier "${rule.kind}" must appear after "${rule.after}"`,
      );
    }
  }
}
