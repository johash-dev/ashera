/**
 * Public API of the editor module (Phase 2): the Catalog, the starter arrangement of the TV wall and
 * the rules Items obey (inside the Room, no overlaps, Door swing clear), as pure logic.
 */
export { CATALOG, TV_FEET_HEIGHT, TV_STAND_DOORS } from './catalog';
export type { ItemType, ItemTypeId, Size } from './catalog';
export { clearOfDoorSwing, itemsIntersect, TV_SIZES, tvSizeFromSearch, tvWallItems } from './tvWall';
export type { Item, TvSize } from './tvWall';
