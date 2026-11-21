import { wallLength } from './geometry';
import type { Room, WallId } from './types';

/** A stretch of Skirting along a Wall, in wall-local feet from the Wall's start corner. */
export interface SkirtingRun {
  readonly u0: number;
  readonly u1: number;
}

/**
 * The stretches of a Wall's Skirting: its full interior length, broken wherever an Opening
 * reaches below the top of the Skirting (a doorway; a window sill is normally above it).
 * Assumes a valid Room (openings fit and do not overlap — see validateRoom).
 */
export function skirtingRuns(room: Room, wall: WallId): SkirtingRun[] {
  const length = wallLength(room, wall);
  const breaks = room.openings
    .filter((o) => o.wall === wall && o.sill < room.skirting.height)
    .sort((a, b) => a.offset - b.offset);

  const runs: SkirtingRun[] = [];
  let u = 0;
  for (const opening of breaks) {
    if (opening.offset > u) runs.push({ u0: u, u1: opening.offset });
    u = opening.offset + opening.width;
  }
  if (u < length) runs.push({ u0: u, u1: length });
  return runs;
}
