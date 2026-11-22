import { floorBounds } from './geometry';
import type { Room, WallId } from './types';

/** A Wall's start corner, the direction it runs (clockwise from above) and its outward normal. */
export interface WallFrame {
  readonly start: readonly [number, number];
  readonly along: readonly [number, number];
  readonly outward: readonly [number, number];
}

export function wallFrame(room: Room, wall: WallId): WallFrame {
  const { minX, maxX, minZ, maxZ } = floorBounds(room);
  switch (wall) {
    case 'north':
      return { start: [minX, minZ], along: [1, 0], outward: [0, -1] };
    case 'east':
      return { start: [maxX, minZ], along: [0, 1], outward: [1, 0] };
    case 'south':
      return { start: [maxX, maxZ], along: [-1, 0], outward: [0, 1] };
    case 'west':
      return { start: [minX, maxZ], along: [0, -1], outward: [-1, 0] };
  }
}
