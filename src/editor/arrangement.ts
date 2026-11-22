import { type Room } from '../room';
import { deskItems } from './desk';
import { type Item } from './items';
import { sofaItems } from './sofa';
import { tvWallItems, type TvSize } from './tvWall';

/** The starter arrangement: every fixed Item in the Room, placed from the Room and the Catalog. */
export function starterArrangement(room: Room, tvSize: TvSize): Item[] {
  return [...tvWallItems(room, tvSize), ...deskItems(room), ...sofaItems(room)];
}
