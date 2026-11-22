import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, clearHeightAtWall, floorBounds, WALLS } from '../room';
import { starterArrangement } from './arrangement';
import { clearOfDoorSwing, itemBox, itemsIntersect } from './items';
import { SOFA_CHOICES, sofaItems } from './sofa';
import { TV_SIZES } from './tvWall';

const COMBINATIONS = TV_SIZES.flatMap((tvSize) => SOFA_CHOICES.map((sofa) => [tvSize, sofa] as const));

describe.each(COMBINATIONS)('starterArrangement with the %i″ TV and the %s sofa', (tvSize, sofa) => {
  const items = starterArrangement(ASHERS_ROOM, tvSize, sofa);

  it('has the TV wall, the desk and its setup, and the sofa', () => {
    const types = items.map((i) => i.type);
    const sofaTypes = sofaItems(ASHERS_ROOM, sofa).map((i) => i.type);
    for (const type of [
      'tv-stand',
      'desk',
      'monitor',
      'pc-tower',
      'keyboard',
      'mouse',
      'gaming-chair',
      'rug',
      'pegboard',
      ...sofaTypes,
    ])
      expect(types).toContain(type);
  });

  it('keeps every Item within the floor and below every Beam', () => {
    const { minX, maxX, minZ, maxZ } = floorBounds(ASHERS_ROOM);
    const lowest = Math.min(...WALLS.map((wall) => clearHeightAtWall(ASHERS_ROOM, wall)));
    for (const item of items) {
      const { position, size } = itemBox(item);
      expect(position[0] - size[0] / 2).toBeGreaterThanOrEqual(minX);
      expect(position[0] + size[0] / 2).toBeLessThanOrEqual(maxX);
      expect(position[2] - size[2] / 2).toBeGreaterThanOrEqual(minZ);
      expect(position[2] + size[2] / 2).toBeLessThanOrEqual(maxZ);
      expect(position[1] - size[1] / 2).toBeGreaterThanOrEqual(0);
      expect(position[1] + size[1] / 2).toBeLessThanOrEqual(lowest);
    }
  });

  it('has no two Items intersecting', () => {
    for (const a of items) for (const b of items) if (a !== b) expect(itemsIntersect(a, b)).toBe(false);
  });

  it('keeps every Item out of the Door swing', () => {
    for (const item of items) expect(clearOfDoorSwing(ASHERS_ROOM, item)).toBe(true);
  });
});
