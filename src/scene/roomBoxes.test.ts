import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { beamBox, type Box, doorLeafBox, skirtingBoxes, wallBoxes } from './roomBoxes';

/** Rounds to 4 decimals so 1/12-ft measurements compare exactly. */
const round = (n: number) => Math.round(n * 1e4) / 1e4;
const rounded = (boxes: Box[]): Box[] =>
  boxes.map(({ position, size }) => ({
    position: [round(position[0]), round(position[1]), round(position[2])],
    size: [round(size[0]), round(size[1]), round(size[2])],
  }));

const [DOOR] = ASHERS_ROOM.doors;
if (!DOOR) throw new Error('config has no door');

describe('wallBoxes', () => {
  it('places a solid wall outside the interior face, covering both corners', () => {
    expect(wallBoxes(ASHERS_ROOM, 'north')).toEqual([{ position: [0, 4.75, -4.75], size: [11, 9.5, 0.5] }]);
  });

  it('leaves the doorway gap at the south-east end of south (x 2.92 to 5)', () => {
    expect(rounded(wallBoxes(ASHERS_ROOM, 'south'))).toEqual([
      { position: [3.7083, 8.3333, 4.75], size: [3.5833, 2.3333, 0.5] }, // header over the doorway, x 2.92 to 5.5
      { position: [-1.7917, 4.75, 4.75], size: [7.4167, 9.5, 0.5] }, // solid, x -5.5 to 2.92
    ]);
  });

  it('runs west from its south-west corner, leaving the window gap (z -2.875 to 2.875)', () => {
    expect(rounded(wallBoxes(ASHERS_ROOM, 'west'))).toEqual([
      { position: [-5.25, 4.75, 3.9375], size: [0.5, 9.5, 2.125] }, // from the SW corner, z 5 to 2.875
      { position: [-5.25, 1.75, 0], size: [0.5, 3.5, 5.75] }, // below the sill
      { position: [-5.25, 9.25, 0], size: [0.5, 0.5, 5.75] }, // above the window
      { position: [-5.25, 4.75, -3.9375], size: [0.5, 9.5, 2.125] }, // to the NW corner, z -2.875 to -5
    ]);
  });
});

describe('beamBox', () => {
  it('runs along the top of its wall, inside the room', () => {
    expect(beamBox(ASHERS_ROOM, 'east')).toEqual({ position: [4.625, 9.25, 0], size: [0.75, 0.5, 9] });
  });
});

describe('skirtingBoxes', () => {
  it('stands against the interior face of a wall without openings', () => {
    expect(skirtingBoxes(ASHERS_ROOM, 'north')).toEqual([
      { position: [0, 0.15, -4.475], size: [10, 0.3, 0.05] },
    ]);
  });

  it('stops at the doorway on the south wall', () => {
    expect(rounded(skirtingBoxes(ASHERS_ROOM, 'south'))).toEqual([
      { position: [-1.5417, 0.15, 4.475], size: [6.9167, 0.3, 0.05] }, // x -5 to 1.92
    ]);
  });

  it('runs unbroken past the window on the west wall', () => {
    expect(skirtingBoxes(ASHERS_ROOM, 'west')).toEqual([
      { position: [-4.975, 0.15, 0], size: [0.05, 0.3, 9] },
    ]);
  });
});

describe('doorLeafBox', () => {
  it('lies flat against the east Wall, from the hinge corner along the doorway width', () => {
    expect(rounded([doorLeafBox(ASHERS_ROOM, DOOR)])).toEqual([
      { position: [4.9375, 3.5833, 2.9583], size: [0.125, 7.1667, 3.0833] },
    ]);
  });

  it('mirrors when the hinge is at the far end of the doorway', () => {
    expect(rounded([doorLeafBox(ASHERS_ROOM, { ...DOOR, hinge: 'end' })])).toEqual([
      { position: [1.9792, 3.5833, 2.9583], size: [0.125, 7.1667, 3.0833] },
    ]);
  });
});
