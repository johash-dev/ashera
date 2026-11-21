/** Public API of the room module: the room's measurements and pure geometry. No rendering. */
export type { Beams, Door, Opening, OpeningKind, Room, WallId } from './types';
export { ASHERS_ROOM } from './room.config';
export { clearHeightAtWall, floorBounds, validateRoom, wallLength } from './geometry';
