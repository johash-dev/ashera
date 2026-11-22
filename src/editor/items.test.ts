import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { clearOfDoorSwing, type Item, itemBox, itemsIntersect } from './items';

const item = (position: Item['position'], size: Item['size'], facing: Item['facing'] = 'south'): Item => ({
  id: 'a',
  type: 'desk',
  position,
  size,
  facing,
});

describe('itemBox', () => {
  it('keeps the width west–east for an Item facing south or north', () => {
    expect(itemBox(item([1, 1, 2], [4, 2.5, 2], 'south'))).toEqual({
      position: [1, 1, 2],
      size: [4, 2.5, 2],
    });
    expect(itemBox(item([1, 1, 2], [4, 2.5, 2], 'north')).size).toEqual([4, 2.5, 2]);
  });

  it('turns the width north–south for an Item facing east or west', () => {
    expect(itemBox(item([1, 1, 2], [4, 2.5, 2], 'west'))).toEqual({ position: [1, 1, 2], size: [2, 2.5, 4] });
    expect(itemBox(item([1, 1, 2], [4, 2.5, 2], 'east')).size).toEqual([2, 2.5, 4]);
  });
});

describe('itemsIntersect', () => {
  const box = (x: number, y: number) => item([x, y, 0], [2, 2, 2]);

  it('counts overlapping boxes as intersecting', () => {
    expect(itemsIntersect(box(0, 1), box(1, 1))).toBe(true);
  });

  it('counts boxes that only touch, one resting on the other, as not intersecting', () => {
    expect(itemsIntersect(box(0, 1), box(0, 3))).toBe(false);
    expect(itemsIntersect(box(0, 1), box(2, 1))).toBe(false);
  });

  it('compares the boxes along the Room axes, whichever way each Item faces', () => {
    // 4 ft wide, 1 ft deep: facing west it reaches 2 ft north and south of its centre.
    const turned = item([0, 1, 0], [4, 2, 1], 'west');
    expect(itemsIntersect(turned, item([0, 1, 2.4], [1, 2, 1]))).toBe(true);
    expect(itemsIntersect(turned, item([1.4, 1, 0], [1, 2, 1]))).toBe(false);
  });
});

describe('clearOfDoorSwing', () => {
  const at = (x: number, z: number, size: Item['size'] = [1, 1, 1], facing: Item['facing'] = 'south') =>
    item([x, 0.5, z], size, facing);

  it('rejects an Item standing where the Door opens (next to the south-east corner)', () => {
    expect(clearOfDoorSwing(ASHERS_ROOM, at(4, 3.5))).toBe(false);
  });

  it('accepts an Item beyond the Door leaf’s reach', () => {
    expect(clearOfDoorSwing(ASHERS_ROOM, at(-4, 3.5))).toBe(true);
  });

  it('uses the Item’s box along the Room axes, so a turned Item can reach into the swing', () => {
    // Centred about 1.9 ft north of the swing's edge, 4 ft wide: facing south it stays clear, facing west it reaches in.
    expect(clearOfDoorSwing(ASHERS_ROOM, at(4.5, -0.5, [4, 1, 1], 'south'))).toBe(true);
    expect(clearOfDoorSwing(ASHERS_ROOM, at(4.5, -0.5, [4, 1, 1], 'west'))).toBe(false);
  });
});
