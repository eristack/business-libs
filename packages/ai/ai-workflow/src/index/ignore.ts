/** Minimal glob matcher for ignore patterns (**, *, ?). */
export function compileIgnore(patterns: string[]): (relPath: string) => boolean {
  const regs = patterns.map((pattern) => globToRegExp(pattern));
  return (relPath: string) => {
    const normalized = relPath.replace(/\\/g, "/");
    return regs.some((re) => re.test(normalized));
  };
}

function globToRegExp(glob: string): RegExp {
  let source = "";
  const g = glob.replace(/\\/g, "/");
  for (let i = 0; i < g.length; i++) {
    const c = g[i]!;
    if (c === "*" && g[i + 1] === "*") {
      source += ".*";
      i++;
      if (g[i + 1] === "/") i++;
      continue;
    }
    if (c === "*") {
      source += "[^/]*";
      continue;
    }
    if (c === "?") {
      source += "[^/]";
      continue;
    }
    if ("+.^${}()|[]\\".includes(c)) {
      source += `\\${c}`;
      continue;
    }
    source += c;
  }
  return new RegExp(`^${source}$`, "i");
}
