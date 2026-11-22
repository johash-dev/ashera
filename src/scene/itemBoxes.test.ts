import { describe, expect, it } from 'vitest';
import { type Item } from '../editor';
import { standBoxes } from './itemBoxes';

const STAND: Item = { id: 'tv-stand', type: 'tv-stand', position: [0, 1.25, -4], size: [8, 1.5, 1] };

describe('standBoxes', () => {
  it('draws the body at the Item box', () => {
    expect(standBoxes(STAND, 2).body).toEqual({ position: [0, 1.25, -4], size: [8, 1.5, 1] });
  });

  it('puts the doors side by side on the front face, with equal gaps around them', () => {
    const { doors } = standBoxes(STAND, 2);
    expect(doors).toHaveLength(2);
    const [left, right] = doors;
    if (!left || !right) throw new Error('expected two doors');
    expect(left.position[0]).toBeCloseTo(-right.position[0]);
    expect(left.size[0]).toBeCloseTo(right.size[0]);
    const gap = right.position[0] - right.size[0] / 2 - (left.position[0] + left.size[0] / 2);
    expect(4 - (right.position[0] + right.size[0] / 2)).toBeCloseTo(gap); // edge gap = middle gap
    expect(left.position[2] - left.size[2] / 2).toBeCloseTo(-3.5); // on the front face (south)
    expect(left.position[1]).toBe(1.25);
  });
});
