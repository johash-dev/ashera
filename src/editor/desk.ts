import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { type Item } from './items';
import { tvStandFront } from './tvWall';

/** The keyboard and mouse sit this far back from the desk's front edge (feet). */
const KEYBOARD_FROM_FRONT = 3 / 12;
/** Gap between the keyboard and the mouse, and between the PC tower and the desk's south edge (feet). */
const MOUSE_GAP = 2 / 12;
const TOWER_FROM_SOUTH_EDGE = 2 / 12;

/**
 * Asher's computer desk on the east wall, facing west, its north end level with the TV stand's
 * front so it stays clear of the Door swing; the monitor, PC tower, keyboard and mouse on it, and
 * the gaming chair at it (docs/specs/desk-and-sofa.md). Asher sits facing east, so his right is south.
 */
export function deskItems(room: Room): Item[] {
  const { maxX } = floorBounds(room);
  const [deskWidth, deskHeight, deskDepth] = CATALOG.desk.size;
  const deskCentreZ = tvStandFront(room) + deskWidth / 2;
  const deskFront = maxX - deskDepth;
  const deskSouth = deskCentreZ + deskWidth / 2;

  const monitor = CATALOG.monitor.size;
  const tower = CATALOG['pc-tower'].size;
  const keyboard = CATALOG.keyboard.size;
  const mouse = CATALOG.mouse.size;
  const chair = CATALOG['gaming-chair'].size;
  const keyboardX = deskFront + KEYBOARD_FROM_FRONT + keyboard[2] / 2;

  /** An Item on the desk top, facing west, with its back to the wall unless `x` says otherwise. */
  const onDesk = (type: 'monitor' | 'pc-tower' | 'keyboard' | 'mouse', x: number, z: number): Item => ({
    id: type,
    type,
    position: [x, deskHeight + CATALOG[type].size[1] / 2, z],
    size: CATALOG[type].size,
    facing: 'west',
  });

  return [
    {
      id: 'desk',
      type: 'desk',
      position: [maxX - deskDepth / 2, deskHeight / 2, deskCentreZ],
      size: CATALOG.desk.size,
      facing: 'west',
    },
    onDesk('monitor', maxX - monitor[2] / 2, deskCentreZ),
    onDesk('pc-tower', maxX - tower[2] / 2, deskSouth - TOWER_FROM_SOUTH_EDGE - tower[0] / 2),
    onDesk('keyboard', keyboardX, deskCentreZ),
    onDesk(
      'mouse',
      deskFront + KEYBOARD_FROM_FRONT + mouse[2] / 2,
      deskCentreZ + keyboard[0] / 2 + MOUSE_GAP + mouse[0] / 2,
    ),
    {
      id: 'gaming-chair',
      type: 'gaming-chair',
      position: [deskFront - chair[2] / 2, chair[1] / 2, deskCentreZ],
      size: chair,
      facing: 'east',
    },
  ];
}
