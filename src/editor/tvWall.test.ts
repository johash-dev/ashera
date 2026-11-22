import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, clearHeightAtWall, floorBounds } from '../room';
import { CATALOG, type ItemTypeId } from './catalog';
import {
  clearOfDoorSwing,
  type Item,
  itemsIntersect,
  TV_SIZES,
  tvSizeFromSearch,
  tvWallItems,
  type TvSize,
} from './tvWall';

const round = (n: number) => Math.round(n * 1e4) / 1e4;

function find(tvSize: TvSize, type: ItemTypeId): Item {
  const item = tvWallItems(ASHERS_ROOM, tvSize).find((i) => i.type === type);
  if (!item) throw new Error(`no ${type} in the starter arrangement`);
  return item;
}
const stand = () => find(55, 'tv-stand');
const bottom = ({ position, size }: Item) => position[1] - size[1] / 2;
const top = ({ position, size }: Item) => position[1] + size[1] / 2;

describe('tvWallItems: the stand', () => {
  it('has the TV stand at its Catalog size: 8 ft wide, 1.5 ft tall, 1 ft deep', () => {
    expect(stand().size).toEqual([8, 1.5, 1]);
    expect(stand().size).toEqual(CATALOG['tv-stand'].size);
  });

  it('hangs the stand with its underside 0.5 ft and its top 2 ft above the floor', () => {
    expect(bottom(stand())).toBe(0.5);
    expect(top(stand())).toBe(2);
  });

  it('centres the stand on the TV wall with its back against the wall', () => {
    const { minZ } = floorBounds(ASHERS_ROOM);
    const { position, size } = stand();
    expect(position[0]).toBe(0);
    expect(position[2] - size[2] / 2).toBe(minZ);
  });
});

describe('tvWallItems: the TV', () => {
  it('uses the 55″ TV from the Catalog: 48.4 × 27.9 in panel on 3 in legs, 2 in deep', () => {
    expect(find(55, 'tv-55').size.map(round)).toEqual([4.0333, 2.575, 0.1667]);
    expect(find(55, 'tv-55').size).toEqual(CATALOG['tv-55'].size);
  });

  it('uses the 65″ TV from the Catalog: 57.0 × 32.7 in panel on 3 in legs, 2 in deep', () => {
    expect(find(65, 'tv-65').size.map(round)).toEqual([4.75, 2.975, 0.1667]);
    expect(tvWallItems(ASHERS_ROOM, 65).some((i) => i.type === 'tv-55')).toBe(false);
  });

  it.each(TV_SIZES)('stands the %i″ TV on the stand top, centred, set back towards the Wall', (tvSize) => {
    const tv = find(tvSize, tvSize === 55 ? 'tv-55' : 'tv-65');
    expect(bottom(tv)).toBeCloseTo(top(stand()));
    expect(tv.position[0]).toBe(stand().position[0]);
    expect(tv.position[2]).toBeLessThan(stand().position[2]);
  });
});

describe('tvWallItems: the PS5 and the soundbar', () => {
  it('uses the Catalog sizes: PS5 3.8 × 14.1 × 8.5 in upright, soundbar 2.5 ft × 2.6 in × 4 in', () => {
    expect(find(55, 'ps5').size.map(round)).toEqual([0.3167, 1.175, 0.7083]);
    expect(find(55, 'soundbar').size.map(round)).toEqual([2.5, 0.2167, 0.3333]);
  });

  it.each(TV_SIZES)('stands the PS5 upright on the stand, 1 ft in from its west end (%i″)', (tvSize) => {
    const ps5 = find(tvSize, 'ps5');
    const s = stand();
    expect(bottom(ps5)).toBeCloseTo(top(s));
    expect(ps5.position[0] - ps5.size[0] / 2).toBeCloseTo(s.position[0] - s.size[0] / 2 + 1);
  });

  it.each(TV_SIZES)(
    'stands the soundbar in front of the TV, centred, front flush with the stand (%i″)',
    (tvSize) => {
      const bar = find(tvSize, 'soundbar');
      const tv = find(tvSize, tvSize === 55 ? 'tv-55' : 'tv-65');
      const s = stand();
      expect(bottom(bar)).toBeCloseTo(top(s));
      expect(bar.position[0]).toBe(tv.position[0]);
      expect(bar.position[2] + bar.size[2] / 2).toBeCloseTo(s.position[2] + s.size[2] / 2);
      expect(bar.position[2]).toBeGreaterThan(tv.position[2]);
    },
  );

  it.each(TV_SIZES)('keeps everything on the stand within its top (%i″)', (tvSize) => {
    const s = stand();
    for (const item of tvWallItems(ASHERS_ROOM, tvSize).filter((i) => i.type !== 'tv-stand')) {
      expect(item.position[0] - item.size[0] / 2).toBeGreaterThanOrEqual(s.position[0] - s.size[0] / 2);
      expect(item.position[0] + item.size[0] / 2).toBeLessThanOrEqual(s.position[0] + s.size[0] / 2);
      expect(item.position[2] - item.size[2] / 2).toBeGreaterThanOrEqual(s.position[2] - s.size[2] / 2);
      expect(item.position[2] + item.size[2] / 2).toBeLessThanOrEqual(s.position[2] + s.size[2] / 2 + 1e-9);
    }
  });
});

describe.each(TV_SIZES)('tvWallItems with the %i″ TV', (tvSize) => {
  const items = tvWallItems(ASHERS_ROOM, tvSize);

  it('keeps every Item within the floor and below the TV wall', () => {
    const { minX, maxX, minZ, maxZ } = floorBounds(ASHERS_ROOM);
    for (const { position, size } of items) {
      expect(position[0] - size[0] / 2).toBeGreaterThanOrEqual(minX);
      expect(position[0] + size[0] / 2).toBeLessThanOrEqual(maxX);
      expect(position[2] - size[2] / 2).toBeGreaterThanOrEqual(minZ);
      expect(position[2] + size[2] / 2).toBeLessThanOrEqual(maxZ);
      expect(position[1] - size[1] / 2).toBeGreaterThanOrEqual(0);
      expect(position[1] + size[1] / 2).toBeLessThanOrEqual(clearHeightAtWall(ASHERS_ROOM, 'north'));
    }
  });

  it('has no two Items intersecting', () => {
    for (const a of items) for (const b of items) if (a !== b) expect(itemsIntersect(a, b)).toBe(false);
  });

  it('keeps every Item out of the Door swing', () => {
    for (const item of items) expect(clearOfDoorSwing(ASHERS_ROOM, item)).toBe(true);
  });
});

describe('itemsIntersect', () => {
  const box = (x: number, y: number): Item => ({
    id: 'a',
    type: 'tv-stand',
    position: [x, y, 0],
    size: [2, 2, 2],
  });

  it('counts overlapping boxes as intersecting', () => {
    expect(itemsIntersect(box(0, 1), box(1, 1))).toBe(true);
  });

  it('counts boxes that only touch, one resting on the other, as not intersecting', () => {
    expect(itemsIntersect(box(0, 1), box(0, 3))).toBe(false);
    expect(itemsIntersect(box(0, 1), box(2, 1))).toBe(false);
  });
});

describe('clearOfDoorSwing', () => {
  const at = (x: number, z: number): Item => ({
    id: 'a',
    type: 'tv-stand',
    position: [x, 0.5, z],
    size: [1, 1, 1],
  });

  it('rejects an Item standing where the Door opens (next to the south-east corner)', () => {
    expect(clearOfDoorSwing(ASHERS_ROOM, at(4, 3.5))).toBe(false);
  });

  it('accepts an Item beyond the Door leaf’s reach', () => {
    expect(clearOfDoorSwing(ASHERS_ROOM, at(-4, 3.5))).toBe(true);
  });
});

describe('tvSizeFromSearch', () => {
  it('reads ?tv=65 and ?tv=55', () => {
    expect(tvSizeFromSearch('?tv=65')).toBe(65);
    expect(tvSizeFromSearch('?view=top&tv=55')).toBe(55);
  });

  it('falls back to 55″ when missing or unknown', () => {
    expect(tvSizeFromSearch('')).toBe(55);
    expect(tvSizeFromSearch('?tv=75')).toBe(55);
  });
});
