import { doorSwing, floorBounds, type Room } from '../room';
import { CATALOG, type ItemTypeId, type Size, SLAT_PANEL } from './catalog';

/** An Item standing in the Room, facing south from the TV wall: centre of its box and size, in feet. */
export interface Item {
  readonly id: string;
  readonly type: ItemTypeId;
  readonly position: readonly [number, number, number];
  readonly size: Size;
}

/** The TV sizes Asher compares. */
export type TvSize = 55 | 65;
export const TV_SIZES: readonly TvSize[] = [55, 65];
const DEFAULT_TV_SIZE: TvSize = 55;

/** The floating stand hangs this far above the floor (owner's sketch). */
const STAND_UNDERSIDE = 0.5;
/** The TV's back sits this far in front of the stand's back, leaving the front free for the soundbar. */
const TV_SET_BACK = 0.25;
/** The PS5's west side sits this far in from the stand's west end. */
const PS5_IN_FROM_WEST = 1;

/** The starter arrangement: the fixed Items of the TV wall, placed from the Room and the Catalog. */
export function tvWallItems(room: Room, tvSize: TvSize): Item[] {
  const { minX, maxX, minZ } = floorBounds(room);
  // Items stand off the Slat panel face, not the bare Wall.
  const panelFace = minZ + SLAT_PANEL.depth;
  const centreX = (minX + maxX) / 2;

  const standSize = CATALOG['tv-stand'].size;
  const standTop = STAND_UNDERSIDE + standSize[1];
  const tvType = tvSize === 55 ? 'tv-55' : 'tv-65';
  const tv = CATALOG[tvType].size;
  const ps5 = CATALOG.ps5.size;
  const bar = CATALOG.soundbar.size;
  const standFront = panelFace + standSize[2];

  return [
    {
      id: 'tv-stand',
      type: 'tv-stand',
      position: [centreX, STAND_UNDERSIDE + standSize[1] / 2, panelFace + standSize[2] / 2],
      size: standSize,
    },
    {
      id: 'tv',
      type: tvType,
      position: [centreX, standTop + tv[1] / 2, panelFace + TV_SET_BACK + tv[2] / 2],
      size: tv,
    },
    {
      id: 'ps5',
      type: 'ps5',
      position: [
        centreX - standSize[0] / 2 + PS5_IN_FROM_WEST + ps5[0] / 2,
        standTop + ps5[1] / 2,
        panelFace + standSize[2] / 2,
      ],
      size: ps5,
    },
    {
      id: 'soundbar',
      type: 'soundbar',
      position: [centreX, standTop + bar[1] / 2, standFront - bar[2] / 2],
      size: bar,
    },
  ];
}

/** Overlaps smaller than this are rounding, not intersection (feet). */
const TOUCH_TOLERANCE = 1e-9;
const AXES = [0, 1, 2] as const;

/** True when two Items' boxes overlap; boxes that only touch (one resting on another) do not. */
export function itemsIntersect(a: Item, b: Item): boolean {
  return AXES.every((axis) => {
    const gap = Math.abs(a.position[axis] - b.position[axis]);
    return gap < (a.size[axis] + b.size[axis]) / 2 - TOUCH_TOLERANCE;
  });
}

/**
 * True when an Item's footprint stays out of every Door swing. Conservative: it checks the whole
 * circle the Door leaf's end could reach, not only the quarter it sweeps.
 */
export function clearOfDoorSwing(room: Room, item: Item): boolean {
  const [x, , z] = item.position;
  const [width, , depth] = item.size;
  return room.doors.every((door) => {
    const { hinge, radius } = doorSwing(room, door);
    const nearestX = Math.min(Math.max(hinge[0], x - width / 2), x + width / 2);
    const nearestZ = Math.min(Math.max(hinge[1], z - depth / 2), z + depth / 2);
    return Math.hypot(nearestX - hinge[0], nearestZ - hinge[1]) >= radius;
  });
}

/** The TV size asked for by `?tv=55|65`; 55 when missing or unknown. */
export function tvSizeFromSearch(search: string): TvSize {
  const requested = Number(new URLSearchParams(search).get('tv'));
  return TV_SIZES.find((size) => size === requested) ?? DEFAULT_TV_SIZE;
}
