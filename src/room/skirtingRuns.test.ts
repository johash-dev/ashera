import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from './room.config';
import { skirtingRuns } from './skirtingRuns';

describe('skirtingRuns', () => {
  it('runs the full length of a wall without openings', () => {
    expect(skirtingRuns(ASHERS_ROOM, 'north')).toEqual([{ u0: 0, u1: 10 }]);
  });

  it('is broken at the doorway', () => {
    expect(skirtingRuns(ASHERS_ROOM, 'south')).toEqual([{ u0: 37 / 12, u1: 10 }]);
  });

  it('runs past a window, whose sill is above the skirting', () => {
    expect(skirtingRuns(ASHERS_ROOM, 'west')).toEqual([{ u0: 0, u1: 9 }]);
  });
});
