import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { type Item } from './items';

/**
 * The compact sofa: back against the south wall, west end in the window corner, facing north
 * towards the TV (docs/specs/desk-and-sofa.md).
 */
export function sofaItems(room: Room): Item[] {
  const { minX, maxZ } = floorBounds(room);
  const [width, height, depth] = CATALOG['sofa-compact'].size;
  return [
    {
      id: 'sofa',
      type: 'sofa-compact',
      position: [minX + width / 2, height / 2, maxZ - depth / 2],
      size: CATALOG['sofa-compact'].size,
      facing: 'north',
    },
  ];
}
