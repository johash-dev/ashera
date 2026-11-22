import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { type Item } from './items';
import { sofaItems } from './sofa';

/** The pegboard's bottom edge hangs this far above the floor, just above the monitor's top (feet). */
const PEGBOARD_BOTTOM = 4.5;
/** The headphones' top hangs this far below the pegboard's top edge (feet). */
const HEADPHONES_BELOW_TOP = 0.5;
/** The picture frames' bottom edge hangs this far above the floor, above the sofa's top (feet). */
const FRAME_BOTTOM = 4;
/** Gap between neighbouring frames (feet). */
const FRAME_GAP = 0.5;
const FRAME_COUNT = 3;

/**
 * The wall décor, hung on a Wall face (docs/specs/wall-decor.md): the pegboard on the east wall,
 * facing west, centred on the desk, with the headphones on a hook in its north third (Asher's left
 * as he sits) and a small shelf at mid-height in its south third. Three picture frames hang on the
 * south wall, facing north, in a row centred on the sofa's long side (the same spot for both sofas).
 */
export function wallDecorItems(room: Room): Item[] {
  const { maxX, maxZ } = floorBounds(room);
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

  const sofa = sofaItems(room, 'compact').find((item) => item.id === 'sofa');
  if (!sofa) throw new Error('the sofa is missing from the starter arrangement');
  const [frameWidth, frameHeight, frameDepth] = CATALOG.frame.size;
  const frames = Array.from({ length: FRAME_COUNT }, (_, i): Item => ({
    id: `frame-${i + 1}`,
    type: 'frame',
    position: [
      sofa.position[0] + (i - (FRAME_COUNT - 1) / 2) * (frameWidth + FRAME_GAP),
      FRAME_BOTTOM + frameHeight / 2,
      maxZ - frameDepth / 2,
    ],
    size: CATALOG.frame.size,
    facing: 'north',
  }));

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
    ...frames,
  ];
}
