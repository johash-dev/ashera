import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { type Item } from './items';
import { tvStandFront } from './tvWall';

/**
 * The dark rug: its east edge level with the desk's front so the gaming chair stands on it, centred
 * north–south between the TV stand's front and the compact sofa's front. The same spot for both
 * sofas; the L-shaped sofa's short side stands on its edge (docs/specs/desk-and-sofa.md).
 */
export function rugItems(room: Room): Item[] {
  const { maxX, maxZ } = floorBounds(room);
  const [width, height] = CATALOG.rug.size;
  const deskFront = maxX - CATALOG.desk.size[2];
  const sofaFront = maxZ - CATALOG['sofa-compact'].size[2];
  return [
    {
      id: 'rug',
      type: 'rug',
      position: [deskFront - width / 2, height / 2, (tvStandFront(room) + sofaFront) / 2],
      size: CATALOG.rug.size,
      facing: 'north',
    },
  ];
}
