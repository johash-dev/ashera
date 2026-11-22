import { type Room } from '../room';
import { deskItems } from './desk';
import { type Item } from './items';
import { rugItems } from './rug';
import { type SofaChoice, sofaItems } from './sofa';
import { tvWallItems, type TvSize } from './tvWall';
import { wallDecorItems } from './wallDecor';

/** The starter arrangement: every fixed Item in the Room, placed from the Room and the Catalog. */
export function starterArrangement(room: Room, tvSize: TvSize, sofa: SofaChoice): Item[] {
  return [
    ...tvWallItems(room, tvSize),
    ...deskItems(room),
    ...sofaItems(room, sofa),
    ...rugItems(room),
    ...wallDecorItems(room),
  ];
}
