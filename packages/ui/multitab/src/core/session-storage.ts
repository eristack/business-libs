import {
  loadMultitabState,
  saveMultitabState,
  type MultitabState,
} from "./persistence.js";

const DEFAULT_KEY = "eristack.multitab.v1";

export function loadMultitabFromSessionStorage(
  key = DEFAULT_KEY,
): MultitabState | null {
  if (typeof sessionStorage === "undefined") return null;
  return loadMultitabState(() => sessionStorage.getItem(key));
}

export function saveMultitabToSessionStorage(
  state: MultitabState,
  key = DEFAULT_KEY,
): void {
  if (typeof sessionStorage === "undefined") return;
  saveMultitabState(state, (value) => sessionStorage.setItem(key, value));
}
