/** Public API of the room module: the room's measurements and pure geometry. No rendering. */
export type {
  Beams,
  Door,
  Fitting,
  FittingKind,
  FloorTile,
  Opening,
  OpeningKind,
  Room,
  Skirting,
  WallId,
  Walls,
  WindowFrame,
} from './types';
export { ASHERS_ROOM } from './room.config';
export { clearHeightAtWall, floorBounds, validateRoom, WALLS, wallLength } from './geometry';
export { floorTileLines } from './floorTileLines';
export type { TileLine } from './floorTileLines';
export { skirtingRuns } from './skirtingRuns';
export type { SkirtingRun } from './skirtingRuns';
export { DOOR_OPEN_ANGLE_DEG, doorSwing } from './doorSwing';
export type { DoorSwing } from './doorSwing';
export { wallFrame } from './wallFrame';
export type { WallFrame } from './wallFrame';
export { wallPieces } from './wallPieces';
export type { WallPiece } from './wallPieces';
