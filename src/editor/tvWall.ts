import { floorBounds, type Room } from '../room';
import { CATALOG, type ItemTypeId, type Size } from './catalog';

/** An Item standing in the Room, facing south from the TV wall: centre of its box and size, in feet. */
export interface Item {
  readonly id: string;
  readonly type: ItemTypeId;
  readonly position: readonly [number, number, number];
  readonly size: Size;
}

/** The floating stand hangs this far above the floor (owner's sketch). */
const STAND_UNDERSIDE = 0.5;

/** The starter arrangement: the fixed Items of the TV wall, placed from the Room and the Catalog. */
export function tvWallItems(room: Room): Item[] {
  const { minX, maxX, minZ } = floorBounds(room);
  const { size } = CATALOG['tv-stand'];
  const [, height, depth] = size;
  return [
    {
      id: 'tv-stand',
      type: 'tv-stand',
      position: [(minX + maxX) / 2, STAND_UNDERSIDE + height / 2, minZ + depth / 2],
      size,
    },
  ];
}
