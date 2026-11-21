import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from './room.config';
import { wallPieces } from './wallPieces';

describe('wallPieces', () => {
  it('gives one full-height piece for a wall without openings', () => {
    expect(wallPieces(ASHERS_ROOM, 'north')).toEqual([{ u0: 0, u1: 10, v0: 0, v1: 9.5 }]);
    expect(wallPieces(ASHERS_ROOM, 'east')).toHaveLength(1);
  });

  it('cuts a window into left, right, below and above pieces', () => {
    expect(wallPieces(ASHERS_ROOM, 'west')).toEqual([
      { u0: 0, u1: 2.25, v0: 0, v1: 9.5 },
      { u0: 2.25, u1: 6.75, v0: 0, v1: 3.5 },
      { u0: 2.25, u1: 6.75, v0: 7.5, v1: 9.5 },
      { u0: 6.75, u1: 9, v0: 0, v1: 9.5 },
    ]);
  });

  it('cuts a doorway at the corner into a beside piece and a lintel piece', () => {
    expect(wallPieces(ASHERS_ROOM, 'south')).toEqual([
      { u0: 0, u1: 3, v0: 7, v1: 9.5 },
      { u0: 3, u1: 10, v0: 0, v1: 9.5 },
    ]);
  });
});
