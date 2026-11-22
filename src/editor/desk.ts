import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { type Item } from './items';
import { tvStandFront } from './tvWall';

/**
 * Asher's computer desk on the east wall, facing west, its north end level with the TV stand's
 * front so it stays clear of the Door swing (docs/specs/desk-and-sofa.md).
 */
export function deskItems(room: Room): Item[] {
  const { maxX } = floorBounds(room);
  const [width, height, depth] = CATALOG.desk.size;
  return [
    {
      id: 'desk',
      type: 'desk',
      position: [maxX - depth / 2, height / 2, tvStandFront(room) + width / 2],
      size: CATALOG.desk.size,
      facing: 'west',
    },
  ];
}
