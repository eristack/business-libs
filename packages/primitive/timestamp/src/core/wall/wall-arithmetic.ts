import type { WallClock } from "./wall-clock.js";
import { Temporal } from "../engine/temporal.js";
import { plainDateTimeFromWall, wallOf } from "./wall-clock.js";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Add calendar days on the wall civil calendar — no UTC / epoch math. */
export function addWallDays(wall: WallClock, days: number): WallClock {
  const local = wall.local.trim();
  if (DATE_ONLY.test(local)) {
    const next = Temporal.PlainDate.from(local).add({ days });
    return wallOf(next.toString(), wall.timezone);
  }
  const next = plainDateTimeFromWall(wall).add({ days });
  return wallOf(next.toString(), wall.timezone);
}
