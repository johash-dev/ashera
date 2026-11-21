import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { beamBox, wallBoxes } from './roomBoxes';

describe('wallBoxes', () => {
  it('places a solid wall outside the interior face, covering both corners', () => {
    expect(wallBoxes(ASHERS_ROOM, 'north')).toEqual([{ position: [0, 4.75, -4.75], size: [11, 9.5, 0.5] }]);
  });

  it('leaves the doorway gap at the south-east end of south (x 2 to 5)', () => {
    expect(wallBoxes(ASHERS_ROOM, 'south')).toEqual([
      { position: [3.75, 8.25, 4.75], size: [3.5, 2.5, 0.5] }, // header over the doorway, x 2 to 5.5
      { position: [-1.75, 4.75, 4.75], size: [7.5, 9.5, 0.5] }, // solid, x -5.5 to 2
    ]);
  });

  it('runs west from its south-west corner, leaving the window gap (z -2.25 to 2.25)', () => {
    expect(wallBoxes(ASHERS_ROOM, 'west')).toEqual([
      { position: [-5.25, 4.75, 3.625], size: [0.5, 9.5, 2.75] }, // from the SW corner, z 5 to 2.25
      { position: [-5.25, 1.75, 0], size: [0.5, 3.5, 4.5] }, // below the sill
      { position: [-5.25, 8.5, 0], size: [0.5, 2, 4.5] }, // above the window
      { position: [-5.25, 4.75, -3.625], size: [0.5, 9.5, 2.75] }, // to the NW corner, z -2.25 to -5
    ]);
  });
});

describe('beamBox', () => {
  it('runs along the top of its wall, inside the room', () => {
    expect(beamBox(ASHERS_ROOM, 'east')).toEqual({ position: [4.625, 9.25, 0], size: [0.75, 0.5, 9] });
  });
});
