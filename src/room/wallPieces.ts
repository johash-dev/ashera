import { wallLength } from './geometry';
import type { Room, WallId } from './types';

/**
 * A solid rectangle of a Wall's interior face, in wall-local feet:
 * u runs along the wall from its start corner, v runs up from the floor.
 */
export interface WallPiece {
  readonly u0: number;
  readonly u1: number;
  readonly v0: number;
  readonly v1: number;
}

/**
 * The solid rectangles of a Wall, from floor to ceiling, around its Openings.
 * Assumes a valid Room (openings fit and do not overlap — see validateRoom).
 */
export function wallPieces(room: Room, wall: WallId): WallPiece[] {
  const length = wallLength(room, wall);
  const height = room.ceilingHeight;
  const openings = room.openings.filter((o) => o.wall === wall).sort((a, b) => a.offset - b.offset);

  const pieces: WallPiece[] = [];
  let u = 0;
  for (const opening of openings) {
    const end = opening.offset + opening.width;
    const top = opening.sill + opening.height;
    if (opening.offset > u) pieces.push({ u0: u, u1: opening.offset, v0: 0, v1: height });
    if (opening.sill > 0) pieces.push({ u0: opening.offset, u1: end, v0: 0, v1: opening.sill });
    if (top < height) pieces.push({ u0: opening.offset, u1: end, v0: top, v1: height });
    u = end;
  }
  if (u < length) pieces.push({ u0: u, u1: length, v0: 0, v1: height });
  return pieces;
}
