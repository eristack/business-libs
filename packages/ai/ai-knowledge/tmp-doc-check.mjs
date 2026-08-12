import { recommend, loadPlan, listRecipes, listPackages, getCatalog } from "./dist/index.js";

const show = (input) => {
  const r = recommend(input);
  console.log("=== input:", JSON.stringify(input));
  console.log("tokens:", r.input);
  for (const m of r.matches) {
    console.log(
      `  ${m.recipe.id} score=${m.score.toFixed(3)} priority=${m.recipe.priority} triggers=${JSON.stringify(m.matchedTriggers)}`,
    );
  }
  console.log("unmatched:", r.unmatched);
  console.log("fallbackNote:", r.fallbackNote);
  const plan = loadPlan(r);
  console.log("steps:");
  for (const s of plan.steps) {
    console.log(`  ${s.packageName}#${s.skillId} recipes=${JSON.stringify(s.recipeIds)}`);
  }
  console.log("");
};

show(["invoices", "login", "document numbers"]);
show("invoice numbers for an ERP app with logins and prices");
show(["notifications", "pdf export"]);
show("tax");
show("taxonomy");
show(["invoices, login / document numbers"]);
show("price");
show("erp");
console.log("recipe ids:", listRecipes().map((r) => `${r.id}(p${r.priority})`).join(", "));
console.log("packages:", listPackages().map((p) => `${p.name}@${p.version}`).join(", "));
console.log("catalog generatedAt:", getCatalog().generatedAt);
console.log("skills per pkg:", getCatalog().packages.map((p) => `${p.name}: ${p.skills.map((s) => s.id).join("|")}`).join("\n  "));
