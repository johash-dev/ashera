import { describe, expect, it } from 'vitest';
import { floorTileLines } from './floorTileLines';
import { ASHERS_ROOM } from './room.config';

describe('floorTileLines', () => {
  it('lays 2 ft × 4 ft tiles with the long side north–south from the south-west corner', () => {
    const lines = floorTileLines(ASHERS_ROOM);
    // Joints between tiles only: x = -3, -1, 1, 3 running the full depth, z = 0.5, -3.5 running the full width.
    expect(lines).toEqual([
      { from: [-3, -4.5], to: [-3, 4.5] },
      { from: [-1, -4.5], to: [-1, 4.5] },
      { from: [1, -4.5], to: [1, 4.5] },
      { from: [3, -4.5], to: [3, 4.5] },
      { from: [-5, 0.5], to: [5, 0.5] },
      { from: [-5, -3.5], to: [5, -3.5] },
    ]);
  });

  it('swaps the spacing when the long side runs east–west', () => {
    const room = { ...ASHERS_ROOM, floorTile: { ...ASHERS_ROOM.floorTile, longSide: 'east-west' as const } };
    const xs = floorTileLines(room)
      .filter((l) => l.from[0] === l.to[0])
      .map((l) => l.from[0]);
    expect(xs).toEqual([-1, 3]);
  });
});
