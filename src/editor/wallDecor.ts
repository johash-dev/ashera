import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { type Item } from './items';

/** The pegboard's bottom edge hangs this far above the floor, just above the monitor's top (feet). */
const PEGBOARD_BOTTOM = 4.5;

/**
 * The wall décor, hung on a Wall face: the pegboard on the east wall, facing west, centred on the
 * desk (docs/specs/wall-decor.md).
 */
export function wallDecorItems(room: Room): Item[] {
  const { maxX } = floorBounds(room);
  const desk = deskItems(room).find((item) => item.type === 'desk');
  if (!desk) throw new Error('the desk is missing from the starter arrangement');
  const [, height, depth] = CATALOG.pegboard.size;
  return [
    {
      id: 'pegboard',
      type: 'pegboard',
      position: [maxX - depth / 2, PEGBOARD_BOTTOM + height / 2, desk.position[2]],
      size: CATALOG.pegboard.size,
      facing: 'west',
    },
  ];
}
