import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { beamBox, wallBoxes } from './roomBoxes';

describe('wallBoxes', () => {
  it('places a solid wall outside the interior face, covering both corners', () => {
    expect(wallBoxes(ASHERS_ROOM, 'north')).toEqual([{ position: [0, 4.75, -4.75], size: [11, 9.5, 0.5] }]);
  });
});

describe('beamBox', () => {
  it('runs along the top of its wall, inside the room', () => {
    expect(beamBox(ASHERS_ROOM, 'east')).toEqual({ position: [4.625, 9.25, 0], size: [0.75, 0.5, 9] });
  });
});
