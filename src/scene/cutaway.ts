import { floorBounds, type Room, type WallId, WALLS } from '../room';

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
  const outside: Record<WallId, boolean> = {
    north: z < minZ,
    east: x > maxX,
    south: z > maxZ,
    west: x < minX,
  };
  return {
    walls: WALLS.filter((wall) => outside[wall]),
    ceiling: y > room.ceilingHeight,
  };
}
