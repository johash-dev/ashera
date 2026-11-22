import { describe, expect, it } from 'vitest';
import { type Item } from '../editor';
import { standBoxes, tvBoxes } from './itemBoxes';

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

describe('tvBoxes', () => {
  // A 4 ft wide TV, 2.5 ft tall overall on 0.25 ft feet, standing on a floor at y = 2.
  const TV: Item = { id: 'tv', type: 'tv-55', position: [0, 3.25, -4], size: [4, 2.5, 0.2] };

  it('puts the panel above the feet, the full width and depth of the Item', () => {
    const { panel } = tvBoxes(TV, 0.25);
    expect(panel.size).toEqual([4, 2.25, 0.2]);
    expect(panel.position[1] - panel.size[1] / 2).toBeCloseTo(2.25);
    expect(panel.position[1] + panel.size[1] / 2).toBeCloseTo(4.5);
  });

  it('stands on two feet reaching the floor, mirrored either side of centre', () => {
    const { feet } = tvBoxes(TV, 0.25);
    const [left, right] = feet;
    if (!left || !right) throw new Error('expected two feet');
    expect(left.position[0]).toBeCloseTo(-right.position[0]);
    expect(left.position[1] - left.size[1] / 2).toBeCloseTo(2);
    expect(left.size[1]).toBe(0.25);
  });

  it('puts the screen on the panel front, inside its edge', () => {
    const { panel, screen } = tvBoxes(TV, 0.25);
    expect(screen.size[0]).toBeLessThan(panel.size[0]);
    expect(screen.size[1]).toBeLessThan(panel.size[1]);
    expect(screen.position[1]).toBe(panel.position[1]);
    expect(screen.position[2] - screen.size[2] / 2).toBeCloseTo(-3.9);
  });
});
