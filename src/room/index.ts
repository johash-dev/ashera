/** Public API of the room module: the room's measurements and pure geometry. No rendering. */
export type { Beams, Door, Opening, OpeningKind, Room, Skirting, WallId, Walls } from './types';
export { ASHERS_ROOM } from './room.config';
export { clearHeightAtWall, floorBounds, validateRoom, WALLS, wallLength } from './geometry';
export { skirtingRuns } from './skirtingRuns';
export type { SkirtingRun } from './skirtingRuns';
export { wallPieces } from './wallPieces';
export type { WallPiece } from './wallPieces';
