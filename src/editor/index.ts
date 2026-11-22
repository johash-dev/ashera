/**
 * Public API of the editor module (Phase 2): the Catalog, the starter arrangement (TV wall, desk) and
 * the Slat panel, and the rules Items obey (inside the Room, no overlaps, Door swing clear), as pure logic.
 */
export { CATALOG, inches, SLAT_PANEL, TV_LEG_HEIGHT, TV_STAND_DOORS } from './catalog';
export { slatPanelBacking, slatPanelSlats } from './slatPanel';
export type { PanelBox } from './slatPanel';
export type { ItemType, ItemTypeId, Size } from './catalog';
export { starterArrangement } from './arrangement';
export { clearOfDoorSwing, itemBox, itemsIntersect } from './items';
export type { Facing, Item, ItemBox } from './items';
export { tvSizeFromSearch, tvWallItems } from './tvWall';
export type { TvSize } from './tvWall';
