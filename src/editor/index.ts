/**
 * Public API of the editor module (Phase 2): the Catalog, the starter arrangement of the TV wall and
 * the Slat panel, and the rules Items obey (inside the Room, no overlaps, Door swing clear), as pure logic.
 */
export { CATALOG, SLAT_PANEL, TV_LEG_HEIGHT, TV_STAND_DOORS } from './catalog';
export { slatPanelBacking, slatPanelSlats } from './slatPanel';
export type { PanelBox } from './slatPanel';
export type { ItemType, ItemTypeId, Size } from './catalog';
export { clearOfDoorSwing, itemsIntersect, tvSizeFromSearch, tvWallItems } from './tvWall';
export type { Item, TvSize } from './tvWall';
