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
      { u0: 0, u1: 1.625, v0: 0, v1: 9.5 },
      { u0: 1.625, u1: 7.375, v0: 0, v1: 3.5 },
      { u0: 1.625, u1: 7.375, v0: 9, v1: 9.5 },
      { u0: 7.375, u1: 9, v0: 0, v1: 9.5 },
    ]);
  });

  it('cuts a doorway at the corner into a beside piece and a lintel piece', () => {
    expect(wallPieces(ASHERS_ROOM, 'south')).toEqual([
      { u0: 0, u1: 37 / 12, v0: 86 / 12, v1: 9.5 },
      { u0: 37 / 12, u1: 10, v0: 0, v1: 9.5 },
    ]);
  });
});
