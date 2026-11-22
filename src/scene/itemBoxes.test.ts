import { describe, expect, it } from 'vitest';
import { type Item } from '../editor';
import { deskBoxes, ps5Boxes, soundbarBoxes, standBoxes, tvBoxes } from './itemBoxes';

const STAND: Item = {
  id: 'tv-stand',
  type: 'tv-stand',
  position: [0, 1.25, -4],
  size: [8, 1.5, 1],
  facing: 'south',
};

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
  const TV: Item = { id: 'tv', type: 'tv-55', position: [0, 3.25, -4], size: [4, 2.5, 0.2], facing: 'south' };

  it('puts the panel above the feet, the full width and depth of the Item', () => {
    const { panel } = tvBoxes(TV, 0.25);
    expect(panel.size).toEqual([4, 2.25, 0.2]);
    expect(panel.position[1] - panel.size[1] / 2).toBeCloseTo(2.25);
    expect(panel.position[1] + panel.size[1] / 2).toBeCloseTo(4.5);
  });

  it('stands on two thin legs that slant outward from under the panel down to the floor, mirrored', () => {
    const { legs } = tvBoxes(TV, 0.25);
    const [left, right] = legs;
    if (!left || !right) throw new Error('expected two legs');
    expect(left.position[0]).toBeCloseTo(-right.position[0]);
    expect(left.angleRad).toBeCloseTo(-right.angleRad);
    expect(left.position[1]).toBeCloseTo(2.125); // halfway between the floor (2) and the panel (2.25)
    for (const leg of legs) {
      // The leg spans the full drop from the panel to the floor along its slant.
      expect(leg.size[1] * Math.cos(leg.angleRad)).toBeCloseTo(0.25);
      expect(leg.size[0]).toBeLessThan(0.1); // thin
    }
    // The bottom end sits further out than the top: rotating a vertical bar by +angle tilts its top to -x.
    const bottomX = (leg: (typeof legs)[number]) =>
      leg.position[0] + (leg.size[1] / 2) * Math.sin(leg.angleRad);
    expect(bottomX(left)).toBeLessThan(left.position[0]);
    expect(bottomX(right)).toBeGreaterThan(right.position[0]);
  });

  it('keeps the legs within the TV width', () => {
    const { legs } = tvBoxes(TV, 0.25);
    for (const leg of legs) expect(Math.abs(leg.position[0]) + leg.size[1]).toBeLessThan(2);
  });

  it('puts the screen on the panel front, inside its edge', () => {
    const { panel, screen } = tvBoxes(TV, 0.25);
    expect(screen.size[0]).toBeLessThan(panel.size[0]);
    expect(screen.size[1]).toBeLessThan(panel.size[1]);
    expect(screen.position[1]).toBe(panel.position[1]);
    expect(screen.position[2] - screen.size[2] / 2).toBeCloseTo(-3.9);
  });
});

describe('ps5Boxes', () => {
  const PS5: Item = {
    id: 'ps5',
    type: 'ps5',
    position: [-3, 2.6, -4],
    size: [0.3, 1.2, 0.7],
    facing: 'south',
  };

  it('puts the white side panels on its east and west faces around a black core, filling the Item box', () => {
    const { core, sides } = ps5Boxes(PS5);
    const [west, east] = sides;
    if (!west || !east) throw new Error('expected two side panels');
    expect(west.position[0] - west.size[0] / 2).toBeCloseTo(-3.15);
    expect(east.position[0] + east.size[0] / 2).toBeCloseTo(-2.85);
    expect(core.size[0] + west.size[0] + east.size[0]).toBeCloseTo(0.3);
    expect(core.size[1]).toBe(1.2);
  });
});

describe('soundbarBoxes', () => {
  const BAR: Item = {
    id: 'soundbar',
    type: 'soundbar',
    position: [0, 2.1, -3.67],
    size: [2.5, 0.2, 0.33],
    facing: 'south',
  };

  it('draws the body at the Item box and the grille on its front face, inside its edge', () => {
    const { body, grille } = soundbarBoxes(BAR);
    expect(body).toEqual({ position: [0, 2.1, -3.67], size: [2.5, 0.2, 0.33] });
    expect(grille.size[0]).toBeLessThan(2.5);
    expect(grille.size[1]).toBeLessThan(0.2);
    expect(grille.position[2] - grille.size[2] / 2).toBeCloseTo(-3.67 + 0.165);
  });
});

describe('deskBoxes', () => {
  // A 4 × 2 ft desk facing west, top 2.5 ft high, against a wall at x = 5.
  const DESK: Item = {
    id: 'desk',
    type: 'desk',
    position: [4, 1.25, -1.5],
    size: [4, 2.5, 2],
    facing: 'west',
  };

  it('lays the top over the whole footprint along the Room axes, flush with the desk height', () => {
    const { top } = deskBoxes(DESK);
    expect(top.size[0]).toBe(2);
    expect(top.size[2]).toBe(4);
    expect(top.position[1] + top.size[1] / 2).toBeCloseTo(2.5);
  });

  it('stands four legs from the floor to the top, one in each corner inside the footprint', () => {
    const { top, legs } = deskBoxes(DESK);
    expect(legs).toHaveLength(4);
    for (const leg of legs) {
      expect(leg.position[1] - leg.size[1] / 2).toBeCloseTo(0);
      expect(leg.position[1] + leg.size[1] / 2).toBeCloseTo(top.position[1] - top.size[1] / 2);
      expect(Math.abs(leg.position[0] - 4) + leg.size[0] / 2).toBeLessThanOrEqual(1);
      expect(Math.abs(leg.position[2] + 1.5) + leg.size[2] / 2).toBeLessThanOrEqual(2);
    }
    expect(new Set(legs.map((leg) => `${leg.position[0]},${leg.position[2]}`)).size).toBe(4);
  });
});
