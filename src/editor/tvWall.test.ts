import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, clearHeightAtWall, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { tvWallItems } from './tvWall';

const stand = () => {
  const item = tvWallItems(ASHERS_ROOM).find((i) => i.type === 'tv-stand');
  if (!item) throw new Error('no TV stand in the starter arrangement');
  return item;
};

describe('tvWallItems', () => {
  it('has the TV stand at its Catalog size: 8 ft wide, 1.5 ft tall, 1 ft deep', () => {
    expect(stand().size).toEqual([8, 1.5, 1]);
    expect(stand().size).toEqual(CATALOG['tv-stand'].size);
  });

  it('hangs the stand with its underside 0.5 ft and its top 2 ft above the floor', () => {
    const { position, size } = stand();
    expect(position[1] - size[1] / 2).toBe(0.5);
    expect(position[1] + size[1] / 2).toBe(2);
  });

  it('centres the stand on the TV wall with its back against the wall', () => {
    const { minZ } = floorBounds(ASHERS_ROOM);
    const { position, size } = stand();
    expect(position[0]).toBe(0);
    expect(position[2] - size[2] / 2).toBe(minZ);
  });
});

describe('tvWallItems inside the Room', () => {
  it('keeps every Item within the floor and below the TV wall', () => {
    const { minX, maxX, minZ, maxZ } = floorBounds(ASHERS_ROOM);
    for (const { position, size } of tvWallItems(ASHERS_ROOM)) {
      expect(position[0] - size[0] / 2).toBeGreaterThanOrEqual(minX);
      expect(position[0] + size[0] / 2).toBeLessThanOrEqual(maxX);
      expect(position[2] - size[2] / 2).toBeGreaterThanOrEqual(minZ);
      expect(position[2] + size[2] / 2).toBeLessThanOrEqual(maxZ);
      expect(position[1] - size[1] / 2).toBeGreaterThanOrEqual(0);
      expect(position[1] + size[1] / 2).toBeLessThanOrEqual(clearHeightAtWall(ASHERS_ROOM, 'north'));
    }
  });
});
