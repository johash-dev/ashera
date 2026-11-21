import { floorBounds, type Room, type WallId } from '../room';

export interface HiddenSurfaces {
  /** Walls hidden because the camera is on their outer side, in north, east, south, west order. */
  readonly walls: readonly WallId[];
  /** The ceiling is hidden when the camera is above it. */
  readonly ceiling: boolean;
}

/**
 * Cutaway: which surfaces to hide so a camera outside the Room can see in.
 * A camera inside the Room hides nothing.
 */
export function hiddenSurfaces(room: Room, [x, y, z]: readonly [number, number, number]): HiddenSurfaces {
  const { minX, maxX, minZ, maxZ } = floorBounds(room);
  const walls: WallId[] = [];
  if (z < minZ) walls.push('north');
  if (x > maxX) walls.push('east');
  if (z > maxZ) walls.push('south');
  if (x < minX) walls.push('west');
  return {
    walls,
    ceiling: y > room.ceilingHeight,
  };
}
