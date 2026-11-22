import { doorSwing, type Room, type WallId } from '../room';
import { type ItemTypeId, type Size } from './catalog';

/** The compass direction an Item's front points. */
export type Facing = WallId;

/** An Item standing in the Room: centre of its box, its Catalog size and the way it faces, in feet. */
export interface Item {
  readonly id: string;
  readonly type: ItemTypeId;
  readonly position: readonly [number, number, number];
  readonly size: Size;
  readonly facing: Facing;
}

/** A box along the Room's axes: centre and extent west–east, up, north–south (feet). */
export interface ItemBox {
  readonly position: readonly [number, number, number];
  readonly size: Size;
}

/** The space an Item takes along the Room's axes: an Item facing east or west runs its width north–south. */
export function itemBox({ position, size, facing }: Item): ItemBox {
  const [width, height, depth] = size;
  const turned = facing === 'east' || facing === 'west';
  return { position, size: turned ? [depth, height, width] : size };
}

/** Overlaps smaller than this are rounding, not intersection (feet). */
const TOUCH_TOLERANCE = 1e-9;
const AXES = [0, 1, 2] as const;

/** A floor covering other Items stand on, so it never counts as intersecting them. */
const isFloorCovering = (item: Item) => item.type === 'rug';

/**
 * True when two Items' boxes overlap; boxes that only touch (one resting on another) do not, and a
 * rug (a floor covering) overlaps nothing.
 */
export function itemsIntersect(a: Item, b: Item): boolean {
  if (isFloorCovering(a) || isFloorCovering(b)) return false;
  const boxA = itemBox(a);
  const boxB = itemBox(b);
  return AXES.every((axis) => {
    const gap = Math.abs(boxA.position[axis] - boxB.position[axis]);
    return gap < (boxA.size[axis] + boxB.size[axis]) / 2 - TOUCH_TOLERANCE;
  });
}

/**
 * True when an Item's footprint stays out of every Door swing. Conservative: it checks the whole
 * circle the Door leaf's end could reach, not only the quarter it sweeps.
 */
export function clearOfDoorSwing(room: Room, item: Item): boolean {
  const { position, size } = itemBox(item);
  const [x, , z] = position;
  const [width, , depth] = size;
  return room.doors.every((door) => {
    const { hinge, radius } = doorSwing(room, door);
    const nearestX = Math.min(Math.max(hinge[0], x - width / 2), x + width / 2);
    const nearestZ = Math.min(Math.max(hinge[1], z - depth / 2), z + depth / 2);
    return Math.hypot(nearestX - hinge[0], nearestZ - hinge[1]) >= radius;
  });
}
