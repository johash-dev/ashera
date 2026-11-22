import { floorBounds } from './geometry';
import type { Room } from './types';

/** One grid line on the floor, in scene coordinates (feet): x, z of both ends. */
export interface TileLine {
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
}

/**
 * The joints between floor tiles: lines running the full floor width or depth, one per tile edge
 * inside the Room. The grid starts at the south-west corner, so partial tiles fall on the north and east.
 */
export function floorTileLines(room: Room): TileLine[] {
  const { minX, maxX, minZ, maxZ } = floorBounds(room);
  const { length, width, longSide } = room.floorTile;
  const [stepX, stepZ] = longSide === 'north-south' ? [width, length] : [length, width];
  const lines: TileLine[] = [];
  for (let x = minX + stepX; x < maxX; x += stepX) lines.push({ from: [x, minZ], to: [x, maxZ] });
  for (let z = maxZ - stepZ; z > minZ; z -= stepZ) lines.push({ from: [minX, z], to: [maxX, z] });
  return lines;
}
