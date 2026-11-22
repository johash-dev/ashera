import { describe, expect, it } from 'vitest';
import { type Item } from '../editor';
import {
  chairBoxes,
  deskBoxes,
  keyboardBoxes,
  monitorBoxes,
  ps5Boxes,
  sofaBoxes,
  soundbarBoxes,
  standBoxes,
  towerBoxes,
  tvBoxes,
} from './itemBoxes';
import { type Box } from './roomBoxes';

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

/** True when `inner` lies within `outer` on every axis (feet, with a hair of rounding). */
function within(inner: Box, outer: Box): boolean {
  return ([0, 1, 2] as const).every((axis) => {
    const gap = Math.abs(inner.position[axis] - outer.position[axis]);
    return gap + inner.size[axis] / 2 <= outer.size[axis] / 2 + 1e-9;
  });
}

describe('sofaBoxes', () => {
  // The compact sofa on the south wall, facing north: its back is on the south side.
  const SOFA: Item = {
    id: 'sofa',
    type: 'sofa-compact',
    position: [-2.25, 1.25, 3],
    size: [5.5, 2.5, 3],
    facing: 'north',
  };
  const box = { position: SOFA.position, size: SOFA.size };

  it('keeps every part within the Item box, the back reaching its full height', () => {
    const { base, back, arms, cushions } = sofaBoxes(SOFA);
    for (const part of [base, back, ...arms, ...cushions]) expect(within(part, box)).toBe(true);
    expect(back.position[1] + back.size[1] / 2).toBeCloseTo(2.5);
  });

  it('puts the back behind the cushions (south), between the arms, and the arms lower than the back', () => {
    const { back, arms, cushions } = sofaBoxes(SOFA);
    for (const cushion of cushions) expect(back.position[2]).toBeGreaterThan(cushion.position[2]);
    for (const arm of arms)
      expect(arm.position[1] + arm.size[1] / 2).toBeLessThan(back.position[1] + back.size[1] / 2);
    const [left, right] = arms;
    if (!left || !right) throw new Error('expected two arms');
    expect(left.position[0]).toBeLessThan(back.position[0]);
    expect(right.position[0]).toBeGreaterThan(back.position[0]);
  });

  it('sits two cushions side by side on the base, between the arms', () => {
    const { base, arms, cushions } = sofaBoxes(SOFA);
    expect(cushions).toHaveLength(2);
    for (const cushion of cushions) {
      expect(cushion.position[1] - cushion.size[1] / 2).toBeCloseTo(base.position[1] + base.size[1] / 2);
    }
    const [left, right] = arms;
    const [c1, c2] = cushions;
    if (!left || !right || !c1 || !c2) throw new Error('expected two arms and two cushions');
    const west = Math.min(c1.position[0], c2.position[0]) - c1.size[0] / 2;
    expect(west).toBeGreaterThanOrEqual(left.position[0] + left.size[0] / 2 - 1e-9);
  });
});

// A monitor on a desk top 2.5 ft up, at the east wall, its front (screen) facing west.
const MONITOR: Item = {
  id: 'monitor',
  type: 'monitor',
  position: [5, 2.5 + 10 / 12, 0],
  size: [2, 20 / 12, 8 / 12],
  facing: 'west',
};

describe('monitorBoxes', () => {
  it('keeps the foot, neck and panel within the Item box', () => {
    const { foot, neck, panel } = monitorBoxes(MONITOR);
    const box = { position: MONITOR.position, size: [8 / 12, 20 / 12, 2] as const };
    for (const part of [foot, neck, panel]) expect(within(part, box)).toBe(true);
  });

  it('puts the panel above the foot, the full width of the Item, along the wall', () => {
    const { foot, panel } = monitorBoxes(MONITOR);
    expect(panel.position[1] - panel.size[1] / 2).toBeGreaterThan(foot.position[1] + foot.size[1] / 2);
    expect(panel.size[2]).toBeCloseTo(2); // its width runs north–south: the Item faces west
    expect(panel.position[1] + panel.size[1] / 2).toBeCloseTo(2.5 + 20 / 12);
  });

  it('puts the screen on the panel’s front, west of it', () => {
    const { panel, screen } = monitorBoxes(MONITOR);
    expect(screen.position[0]).toBeLessThan(panel.position[0]);
    expect(screen.position[0] + screen.size[0] / 2).toBeLessThan(
      panel.position[0] - panel.size[0] / 2 + 0.01,
    );
  });
});

describe('towerBoxes and keyboardBoxes', () => {
  const TOWER: Item = {
    id: 'tower',
    type: 'pc-tower',
    position: [5, 3.25, 1],
    size: [0.7, 1.5, 1.4],
    facing: 'west',
  };
  const KEYBOARD: Item = {
    id: 'kb',
    type: 'keyboard',
    position: [4, 2.56, 0],
    size: [1.4, 0.12, 0.45],
    facing: 'west',
  };

  it('draws the tower body at its box and the front panel on its west face', () => {
    const { body, front } = towerBoxes(TOWER);
    expect(body).toEqual({ position: TOWER.position, size: [1.4, 1.5, 0.7] });
    expect(front.position[0]).toBeLessThan(body.position[0] - body.size[0] / 2 + 0.01);
  });

  it('puts the keys on top of the keyboard body', () => {
    const { body, keys } = keyboardBoxes(KEYBOARD);
    expect(keys.position[1] - keys.size[1] / 2).toBeCloseTo(body.position[1] + body.size[1] / 2);
    expect(keys.size[0]).toBeLessThan(body.size[0]); // inset from the body's edges
    expect(keys.size[2]).toBeLessThan(body.size[2]);
  });
});

describe('chairBoxes', () => {
  // A 27 in square, 50 in tall chair at the desk, facing east: its back is on the west side.
  const CHAIR: Item = {
    id: 'chair',
    type: 'gaming-chair',
    position: [0, 25 / 12, 0],
    size: [27 / 12, 50 / 12, 27 / 12],
    facing: 'east',
  };

  it('keeps every part within the Item box', () => {
    const { base, column, seat, back, arms } = chairBoxes(CHAIR);
    const box = { position: CHAIR.position, size: CHAIR.size };
    for (const part of [...base, column, seat, back, ...arms]) expect(within(part, box)).toBe(true);
  });

  it('puts the backrest behind the seat (west, as the chair faces east), rising to the full height', () => {
    const { seat, back } = chairBoxes(CHAIR);
    expect(back.position[0]).toBeLessThan(seat.position[0]);
    expect(back.position[1] + back.size[1] / 2).toBeCloseTo(50 / 12);
  });

  it('puts the seat on the column and an armrest each side of it', () => {
    const { column, seat, arms } = chairBoxes(CHAIR);
    expect(seat.position[1] - seat.size[1] / 2).toBeGreaterThanOrEqual(
      column.position[1] + column.size[1] / 2 - 1e-9,
    );
    const sides = arms.map((arm) => Math.sign(arm.position[2] - CHAIR.position[2]));
    expect(sides).toContain(1);
    expect(sides).toContain(-1);
  });
});
