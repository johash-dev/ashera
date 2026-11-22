import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { type Item } from './items';

/** The pegboard's bottom edge hangs this far above the floor, just above the monitor's top (feet). */
const PEGBOARD_BOTTOM = 4.5;
/** The headphones' top hangs this far below the pegboard's top edge (feet). */
const HEADPHONES_BELOW_TOP = 0.5;

/**
 * The wall décor, hung on a Wall face (docs/specs/wall-decor.md): the pegboard on the east wall,
 * facing west, centred on the desk, with the headphones on a hook in its north third (Asher's left
 * as he sits) and a small shelf at mid-height in its south third.
 */
export function wallDecorItems(room: Room): Item[] {
  const { maxX } = floorBounds(room);
  const desk = deskItems(room).find((item) => item.type === 'desk');
  if (!desk) throw new Error('the desk is missing from the starter arrangement');
  const [boardWidth, boardHeight, boardDepth] = CATALOG.pegboard.size;
  const boardCentreZ = desk.position[2];
  const boardFront = maxX - boardDepth;
  const thirdCentre = boardWidth / 3;

  /** A piece on the pegboard's front face, facing west, `dz` south of the board's centre. */
  const onPegboard = (type: 'headphones' | 'shelf', dz: number, centreY: number): Item => ({
    id: type,
    type,
    position: [boardFront - CATALOG[type].size[2] / 2, centreY, boardCentreZ + dz],
    size: CATALOG[type].size,
    facing: 'west',
  });

  return [
    {
      id: 'pegboard',
      type: 'pegboard',
      position: [maxX - boardDepth / 2, PEGBOARD_BOTTOM + boardHeight / 2, boardCentreZ],
      size: CATALOG.pegboard.size,
      facing: 'west',
    },
    onPegboard(
      'headphones',
      -thirdCentre,
      PEGBOARD_BOTTOM + boardHeight - HEADPHONES_BELOW_TOP - CATALOG.headphones.size[1] / 2,
    ),
    onPegboard('shelf', thirdCentre, PEGBOARD_BOTTOM + boardHeight / 2),
  ];
}
