import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { type Item, starterArrangement } from '../editor';
import {
  chairBoxes,
  deskBoxes,
  frameBoxes,
  headphonesBoxes,
  keyboardBoxes,
  monitorBoxes,
  mouseBoxes,
  ps5Boxes,
  rugBoxes,
  sofaArmSides,
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
  const BOX = { position: STAND.position, size: STAND.size };

  it('keeps every part within the Item box', () => {
    const { body, top, doors, handles } = standBoxes(STAND, 2);
    for (const part of [body, top, ...doors, ...handles]) expect(within(part, BOX)).toBe(true);
  });

  it('lays a top slab over the whole footprint, flush with the stand’s top', () => {
    const { top } = standBoxes(STAND, 2);
    expect(top.size[0]).toBe(8);
    expect(top.size[2]).toBe(1);
    expect(top.position[1] + top.size[1] / 2).toBeCloseTo(1.25 + 0.75);
  });

  it('puts the doors side by side on the front face, with equal gaps around them', () => {
    const { doors } = standBoxes(STAND, 2);
    expect(doors).toHaveLength(2);
    const [left, right] = doors;
    if (!left || !right) throw new Error('expected two doors');
    expect(left.position[0]).toBeCloseTo(-right.position[0]);
    expect(left.size[0]).toBeCloseTo(right.size[0]);
    const gap = Math.abs(right.position[0] - left.position[0]) - left.size[0];
    expect(4 - (Math.max(left.position[0], right.position[0]) + left.size[0] / 2)).toBeCloseTo(gap); // edge gap = middle gap
    expect(left.position[2] + left.size[2] / 2).toBeLessThan(-3.5); // set into the front face (south)
    expect(left.position[2] + left.size[2] / 2).toBeGreaterThan(-3.5 - 0.05);
  });

  it('keeps the doors clear of the top slab and the floor-side edge, a gap above and below', () => {
    const { top, doors } = standBoxes(STAND, 2);
    const [door] = doors;
    if (!door) throw new Error('expected a door');
    expect(door.position[1] + door.size[1] / 2).toBeLessThan(top.position[1] - top.size[1] / 2);
    expect(door.position[1] - door.size[1] / 2).toBeGreaterThan(0.5);
  });

  it('puts a handle on each door’s inner edge, in front of the door, flush with the stand’s front', () => {
    const { doors, handles } = standBoxes(STAND, 2);
    expect(handles).toHaveLength(2);
    handles.forEach((handle, i) => {
      const door = doors[i];
      if (!door) throw new Error('expected a door');
      expect(handle.position[2]).toBeGreaterThan(door.position[2]);
      expect(handle.position[2] + handle.size[2] / 2).toBeCloseTo(-3.5);
      // Towards the middle of the stand: closer to x = 0 than the door's centre.
      expect(Math.abs(handle.position[0])).toBeLessThan(Math.abs(door.position[0]));
      expect(Math.abs(handle.position[0] - door.position[0])).toBeLessThan(door.size[0] / 2);
    });
  });
});

describe('tvBoxes', () => {
  // A 4 ft wide TV, 2.5 ft tall overall on 0.25 ft feet, standing on a floor at y = 2.
  const TV: Item = { id: 'tv', type: 'tv-55', position: [0, 3.25, -4], size: [4, 2.5, 0.2], facing: 'south' };
  const BOX = { position: TV.position, size: TV.size };

  it('keeps the panel, housing, screen and status light within the Item box', () => {
    const { panel, housing, screen, led } = tvBoxes(TV, 0.25);
    for (const part of [panel, housing, screen, led]) expect(within(part, BOX)).toBe(true);
  });

  it('keeps the slanted legs within the Item box, along the width', () => {
    const { legs } = tvBoxes(TV, 0.25);
    for (const leg of legs) {
      const reach =
        (leg.size[1] / 2) * Math.sin(Math.abs(leg.angleRad)) + (leg.size[0] / 2) * Math.cos(leg.angleRad);
      expect(Math.abs(leg.position[0]) + reach).toBeLessThanOrEqual(2 + 1e-9);
    }
  });

  it('puts the panel above the feet, the full width of the Item, thinner than the Item', () => {
    const { panel } = tvBoxes(TV, 0.25);
    expect(panel.size[0]).toBe(4);
    expect(panel.size[1]).toBeCloseTo(2.25);
    expect(panel.size[2]).toBeLessThan(0.1);
    expect(panel.position[1] - panel.size[1] / 2).toBeCloseTo(2.25);
    expect(panel.position[1] + panel.size[1] / 2).toBeCloseTo(4.5);
  });

  it('puts a housing behind the panel (north), narrower and shorter than it, so the back bulges', () => {
    const { panel, housing } = tvBoxes(TV, 0.25);
    expect(housing.position[2]).toBeLessThan(panel.position[2]);
    expect(housing.size[0]).toBeLessThan(panel.size[0]);
    expect(housing.size[1]).toBeLessThan(panel.size[1]);
    expect(housing.position[2] - housing.size[2] / 2).toBeCloseTo(-4.1); // back of the Item
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

  it('puts the screen on the panel front, inside its edge, flush with the Item’s front', () => {
    const { panel, screen } = tvBoxes(TV, 0.25);
    expect(screen.size[0]).toBeLessThan(panel.size[0]);
    expect(screen.size[1]).toBeLessThan(panel.size[1]);
    expect(screen.position[1]).toBeCloseTo(panel.position[1]);
    expect(screen.position[2] + screen.size[2] / 2).toBeCloseTo(-3.9); // front face (south)
    expect(screen.position[2] - screen.size[2] / 2).toBeCloseTo(panel.position[2] + panel.size[2] / 2);
  });

  it('puts a small status light in the bottom edge, centred, below the screen', () => {
    const { screen, led } = tvBoxes(TV, 0.25);
    expect(led.position[0]).toBeCloseTo(0);
    expect(led.position[1] + led.size[1] / 2).toBeLessThanOrEqual(
      screen.position[1] - screen.size[1] / 2 + 1e-9,
    );
    expect(led.size[0]).toBeLessThan(0.1);
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
  const BOX = { position: PS5.position, size: PS5.size };

  it('keeps every part within the Item box', () => {
    const { core, sides, base, strip } = ps5Boxes(PS5);
    for (const part of [core, ...sides, base, strip]) expect(within(part, BOX)).toBe(true);
  });

  it('puts the white side panels on its east and west faces around a black core, filling the Item width', () => {
    const { core, sides } = ps5Boxes(PS5);
    const [west, east] = [...sides].sort((p, q) => p.position[0] - q.position[0]);
    if (!west || !east) throw new Error('expected two side panels');
    expect(west.position[0] - west.size[0] / 2).toBeCloseTo(-3.15);
    expect(east.position[0] + east.size[0] / 2).toBeCloseTo(-2.85);
    expect(core.size[0] + west.size[0] + east.size[0]).toBeCloseTo(0.3);
  });

  it('stands the panels and core on a base plate that fills the footprint, reaching the full height', () => {
    const { core, sides, base } = ps5Boxes(PS5);
    expect(base.size[0]).toBeCloseTo(0.3);
    expect(base.size[2]).toBeCloseTo(0.7);
    expect(base.position[1] - base.size[1] / 2).toBeCloseTo(2);
    for (const upright of [core, ...sides]) {
      expect(upright.position[1] - upright.size[1] / 2).toBeCloseTo(base.position[1] + base.size[1] / 2);
      expect(upright.position[1] + upright.size[1] / 2).toBeCloseTo(3.2);
    }
  });

  it('runs a light strip down the front of the core, on the centre line, flush with the front (south)', () => {
    const { core, strip } = ps5Boxes(PS5);
    expect(strip.position[0]).toBeCloseTo(-3);
    expect(strip.size[0]).toBeLessThan(core.size[0]);
    expect(strip.size[1]).toBeGreaterThan(0.5);
    expect(strip.position[2] + strip.size[2] / 2).toBeCloseTo(-4 + 0.35);
    // In front of the core, not inside it, so their faces never overlap.
    expect(strip.position[2] - strip.size[2] / 2).toBeCloseTo(core.position[2] + core.size[2] / 2);
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
  const BOX = { position: BAR.position, size: BAR.size };

  it('keeps the body, grille and status light within the Item box', () => {
    const { body, grille, led } = soundbarBoxes(BAR);
    for (const part of [body, grille, led]) expect(within(part, BOX)).toBe(true);
  });

  it('draws the grille on the front face, inside the body’s edge, flush with the Item’s front', () => {
    const { body, grille } = soundbarBoxes(BAR);
    expect(grille.size[0]).toBeLessThan(2.5);
    expect(grille.size[1]).toBeLessThan(0.2);
    expect(grille.position[2] + grille.size[2] / 2).toBeCloseTo(-3.67 + 0.165);
    expect(grille.position[2] - grille.size[2] / 2).toBeCloseTo(body.position[2] + body.size[2] / 2);
  });

  it('puts a small status light in the body’s edge at one end, beside the grille, not over it', () => {
    const { grille, led } = soundbarBoxes(BAR);
    const grilleStart = grille.position[0] - grille.size[0] / 2;
    const grilleEnd = grille.position[0] + grille.size[0] / 2;
    const ledStart = led.position[0] - led.size[0] / 2;
    const ledEnd = led.position[0] + led.size[0] / 2;
    const clear = ledStart >= grilleEnd - 1e-9 || ledEnd <= grilleStart + 1e-9;
    expect(clear).toBe(true);
    expect(Math.abs(led.position[0])).toBeGreaterThan(1);
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

  it('keeps every part within the Item box', () => {
    const { top, legs, rails } = deskBoxes(DESK);
    const box = { position: DESK.position, size: [2, 2.5, 4] as const };
    for (const part of [top, ...legs, ...rails]) expect(within(part, box)).toBe(true);
  });

  it('hangs an apron under the top along the front and the back, flush with the top’s underside', () => {
    const { top, rails } = deskBoxes(DESK);
    const aprons = rails.filter((rail) => rail.size[2] > rail.size[0]);
    expect(aprons).toHaveLength(2);
    for (const apron of aprons) {
      expect(apron.position[1] + apron.size[1] / 2).toBeCloseTo(top.position[1] - top.size[1] / 2);
    }
    const sides = aprons.map((apron) => Math.sign(apron.position[0] - 4)).sort();
    expect(sides).toEqual([-1, 1]); // one at the front, one at the back
  });

  it('runs a low stretcher between the legs at each end, clear of the floor', () => {
    const { legs, rails } = deskBoxes(DESK);
    const stretchers = rails.filter((rail) => rail.size[0] > rail.size[2]);
    expect(stretchers).toHaveLength(2);
    const [north, south] = [...stretchers].sort((a, b) => a.position[2] - b.position[2]);
    if (!north || !south) throw new Error('expected two stretchers');
    expect(north.position[2]).toBeLessThan(DESK.position[2]);
    expect(south.position[2]).toBeGreaterThan(DESK.position[2]);
    for (const stretcher of stretchers) {
      expect(stretcher.position[1] - stretcher.size[1] / 2).toBeGreaterThan(0.2);
      const [leg] = legs;
      if (!leg) throw new Error('expected legs');
      expect(stretcher.size[0]).toBeLessThan(2 - leg.size[0]); // between the legs, not through them
    }
  });
});

/** True when `inner` lies within `outer` on every axis (feet, with a hair of rounding). */
function within(inner: Box, outer: Box): boolean {
  return ([0, 1, 2] as const).every((axis) => {
    const gap = Math.abs(inner.position[axis] - outer.position[axis]);
    return gap + inner.size[axis] / 2 <= outer.size[axis] / 2 + 1e-9;
  });
}

/** The Item's size laid out along the Room axes: width and depth swap when it faces east or west. */
function itemBoxSize(item: Item): Box['size'] {
  const [width, height, depth] = item.size;
  return item.facing === 'east' || item.facing === 'west' ? [depth, height, width] : item.size;
}

describe('sofaArmSides', () => {
  const armCentres = (choice: 'compact' | 'l') =>
    starterArrangement(ASHERS_ROOM, 55, choice)
      .filter((item) => item.type.startsWith('sofa'))
      .map((item) => ({
        item,
        arms: sofaBoxes(item, sofaArmSides(item.type)).arms,
      }));

  it('puts arms at both ends of the compact sofa', () => {
    const compact = armCentres('compact')[0];
    if (!compact) throw new Error('no compact sofa');
    const { item, arms } = compact;
    expect(arms).toHaveLength(2);
    expect(Math.min(...arms.map((a) => a.position[0]))).toBeLessThan(item.position[0]);
    expect(Math.max(...arms.map((a) => a.position[0]))).toBeGreaterThan(item.position[0]);
  });

  it('puts the L’s long-side arm at its east end, away from the corner', () => {
    const long = armCentres('l').find(({ item }) => item.type === 'sofa-l-long');
    if (!long) throw new Error('no long side');
    expect(long.arms).toHaveLength(1);
    expect(long.arms[0]?.position[0]).toBeGreaterThan(long.item.position[0]);
  });

  it('puts the L’s short-side arm at its north end, away from the corner', () => {
    const short = armCentres('l').find(({ item }) => item.type === 'sofa-l-short');
    if (!short) throw new Error('no short side');
    expect(short.arms).toHaveLength(1);
    expect(short.arms[0]?.position[2]).toBeLessThan(short.item.position[2]);
  });
});

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
  const BOTH_ARMS = [-1, 1] as const;

  it('keeps every part within the Item box, the back reaching its full height', () => {
    const { base, back, arms, cushions } = sofaBoxes(SOFA, BOTH_ARMS);
    for (const part of [base, back, ...arms, ...cushions]) expect(within(part, box)).toBe(true);
    expect(back.position[1] + back.size[1] / 2).toBeCloseTo(2.5);
  });

  it('puts the back behind the cushions (south), between the arms, and the arms lower than the back', () => {
    const { back, arms, cushions } = sofaBoxes(SOFA, BOTH_ARMS);
    for (const cushion of cushions) expect(back.position[2]).toBeGreaterThan(cushion.position[2]);
    for (const arm of arms)
      expect(arm.position[1] + arm.size[1] / 2).toBeLessThan(back.position[1] + back.size[1] / 2);
    const [left, right] = arms;
    if (!left || !right) throw new Error('expected two arms');
    expect(left.position[0]).toBeLessThan(back.position[0]);
    expect(right.position[0]).toBeGreaterThan(back.position[0]);
  });

  it('sits two cushions side by side on the base, between the arms', () => {
    const { base, arms, cushions } = sofaBoxes(SOFA, BOTH_ARMS);
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

  it('with one arm, puts it at that end and widens the seat to the other', () => {
    const left = sofaBoxes(SOFA, [-1]);
    const both = sofaBoxes(SOFA, BOTH_ARMS);
    expect(left.arms).toHaveLength(1);
    expect(left.back.size[0]).toBeGreaterThan(both.back.size[0]);
    for (const part of [left.base, left.back, ...left.arms, ...left.cushions])
      expect(within(part, box)).toBe(true);
  });

  it('keeps the feet and back cushions within the Item box too, for every arm arrangement', () => {
    for (const arms of [BOTH_ARMS, [-1], [1], []] as const) {
      const { backCushions, feet } = sofaBoxes(SOFA, arms);
      for (const part of [...backCushions, ...feet]) expect(within(part, box)).toBe(true);
    }
  });

  it('stands the base on four feet in its corners, from the floor to the base’s underside', () => {
    const { base, feet } = sofaBoxes(SOFA, BOTH_ARMS);
    expect(feet).toHaveLength(4);
    for (const foot of feet) {
      expect(foot.position[1] - foot.size[1] / 2).toBeCloseTo(0);
      expect(foot.position[1] + foot.size[1] / 2).toBeCloseTo(base.position[1] - base.size[1] / 2);
    }
    expect(new Set(feet.map((foot) => `${foot.position[0]},${foot.position[2]}`)).size).toBe(4);
  });

  it('puts a back cushion in front of the back frame (north) behind each seat cushion, rising above the arms', () => {
    const { back, arms, cushions, backCushions } = sofaBoxes(SOFA, BOTH_ARMS);
    expect(backCushions).toHaveLength(cushions.length);
    // The test sofa faces north, so its back is on the south side and the cushions lie to the north of it.
    backCushions.forEach((backCushion, i) => {
      const seat = cushions[i];
      if (!seat) throw new Error('expected a seat cushion');
      expect(backCushion.position[0]).toBeCloseTo(seat.position[0]);
      expect(backCushion.size[0]).toBeCloseTo(seat.size[0]);
      expect(backCushion.position[2]).toBeLessThan(back.position[2]); // north of the frame
      expect(backCushion.position[2]).toBeGreaterThan(seat.position[2] + seat.size[2] / 2 - 1e-9); // behind the seat
      for (const arm of arms)
        expect(backCushion.position[1] + backCushion.size[1] / 2).toBeGreaterThan(
          arm.position[1] + arm.size[1] / 2,
        );
    });
  });

  it('keeps the back cushions clear of the back frame and the seat cushions, so no faces overlap', () => {
    const { back, cushions, backCushions } = sofaBoxes(SOFA, BOTH_ARMS);
    const [cushion] = backCushions;
    const [seat] = cushions;
    if (!cushion || !seat) throw new Error('expected cushions');
    // South face of the back cushion meets the frame's north face; its north face meets the seat's south face.
    expect(cushion.position[2] + cushion.size[2] / 2).toBeCloseTo(back.position[2] - back.size[2] / 2);
    expect(cushion.position[2] - cushion.size[2] / 2).toBeCloseTo(seat.position[2] + seat.size[2] / 2);
  });

  it('keeps every part within the Item box for each sofa of both arrangements, as the editor places them', () => {
    for (const choice of ['compact', 'l'] as const) {
      for (const item of starterArrangement(ASHERS_ROOM, 55, choice).filter((i) =>
        i.type.startsWith('sofa'),
      )) {
        const { base, back, arms, cushions, backCushions, feet } = sofaBoxes(item, sofaArmSides(item.type));
        const itemBox = { position: item.position, size: itemBoxSize(item) };
        for (const part of [base, back, ...arms, ...cushions, ...backCushions, ...feet]) {
          expect(within(part, itemBox)).toBe(true);
        }
      }
    }
  });

  it('keeps every part within the Item box whichever way the sofa faces', () => {
    for (const facing of ['north', 'south', 'east', 'west'] as const) {
      const item: Item = { ...SOFA, facing };
      const { base, back, arms, cushions, backCushions, feet } = sofaBoxes(item, BOTH_ARMS);
      const itemBox = { position: item.position, size: itemBoxSize(item) };
      for (const part of [base, back, ...arms, ...cushions, ...backCushions, ...feet]) {
        expect(within(part, itemBox)).toBe(true);
      }
    }
  });

  it('stays within a part budget: a piece is at most 20 boxes however wide', () => {
    const { base, back, arms, cushions, backCushions, feet } = sofaBoxes(SOFA, BOTH_ARMS);
    expect([base, back, ...arms, ...cushions, ...backCushions, ...feet].length).toBeLessThanOrEqual(20);
  });

  it('gives a narrow seat one cushion', () => {
    const narrow: Item = { ...SOFA, size: [2, 2.5, 3] };
    expect(sofaBoxes(narrow, [-1]).cushions).toHaveLength(1);
  });
});

describe('rugBoxes', () => {
  const RUG: Item = {
    id: 'rug',
    type: 'rug',
    position: [0, 0.5 / 24, 0],
    size: [5, 0.5 / 12, 3.5],
    facing: 'north',
  };
  const BOX = { position: RUG.position, size: RUG.size };

  it('keeps every part within the Item box, the top layer reaching the rug’s top', () => {
    const { base, field, lines } = rugBoxes(RUG);
    for (const part of [base, field, ...lines]) expect(within(part, BOX)).toBe(true);
    for (const layer of [field, ...lines]) {
      expect(layer.position[1] + layer.size[1] / 2).toBeCloseTo(0.5 / 12);
    }
  });

  it('lays a base the full footprint, resting on the floor', () => {
    const { base } = rugBoxes(RUG);
    expect(base.size[0]).toBe(5);
    expect(base.size[2]).toBe(3.5);
    expect(base.position[1] - base.size[1] / 2).toBeCloseTo(0);
  });

  it('insets the field from the edge all round, leaving a border', () => {
    const { field } = rugBoxes(RUG);
    expect(field.size[0]).toBeLessThan(5);
    expect(field.size[2]).toBeLessThan(3.5);
    expect((5 - field.size[0]) / 2).toBeCloseTo((3.5 - field.size[2]) / 2); // same border on every side
    expect(field.position[0]).toBeCloseTo(0);
    expect(field.position[2]).toBeCloseTo(0);
  });

  it('runs an accent line round the middle of the border, never over the field', () => {
    const { field, lines } = rugBoxes(RUG);
    expect(lines).toHaveLength(4);
    const fieldEdge = [field.size[0] / 2, field.size[2] / 2];
    for (const line of lines) {
      const reachX = Math.abs(line.position[0]) - line.size[0] / 2;
      const reachZ = Math.abs(line.position[2]) - line.size[2] / 2;
      // Each line lies wholly outside the field's footprint on at least one axis.
      const outside = reachX >= (fieldEdge[0] ?? 0) - 1e-9 || reachZ >= (fieldEdge[1] ?? 0) - 1e-9;
      expect(outside).toBe(true);
    }
  });

  it('closes the ring: its four lines meet at the corners without overlapping', () => {
    const { lines } = rugBoxes(RUG);
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a, b] = [lines[i], lines[j]];
        if (!a || !b) throw new Error('expected lines');
        const overlapX = Math.abs(a.position[0] - b.position[0]) < (a.size[0] + b.size[0]) / 2 - 1e-9;
        const overlapZ = Math.abs(a.position[2] - b.position[2]) < (a.size[2] + b.size[2]) / 2 - 1e-9;
        expect(overlapX && overlapZ).toBe(false);
      }
    }
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
  const BOX = { position: MONITOR.position, size: [8 / 12, 20 / 12, 2] as const };

  it('keeps every part within the Item box', () => {
    const { foot, neck, panel, back, screen, led } = monitorBoxes(MONITOR);
    for (const part of [foot, neck, panel, back, screen, led]) expect(within(part, BOX)).toBe(true);
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

  it('puts a housing and the neck behind the panel (east), the neck reaching up into the housing', () => {
    const { foot, neck, panel, back } = monitorBoxes(MONITOR);
    expect(back.position[0]).toBeGreaterThan(panel.position[0]);
    expect(neck.position[0]).toBeGreaterThan(panel.position[0]);
    expect(back.size[2]).toBeLessThan(panel.size[2]); // narrower than the panel
    expect(neck.position[1] - neck.size[1] / 2).toBeCloseTo(foot.position[1] + foot.size[1] / 2);
    expect(neck.position[1] + neck.size[1] / 2).toBeGreaterThan(back.position[1] - back.size[1] / 2);
  });

  it('puts a small status light in the panel’s bottom bezel, on its front, below the screen', () => {
    const { panel, screen, led } = monitorBoxes(MONITOR);
    expect(led.position[0]).toBeLessThan(panel.position[0]);
    expect(led.position[1] + led.size[1] / 2).toBeLessThan(screen.position[1] - screen.size[1] / 2 + 1e-9);
    expect(led.size[2]).toBeLessThan(0.05); // a few hundredths of a foot along the wall
  });
});

describe('towerBoxes', () => {
  // 8.5 in wide (north–south), 18 in tall, 17 in deep (east–west), facing west, on a desk top 2.5 ft up.
  const TOWER: Item = {
    id: 'tower',
    type: 'pc-tower',
    position: [5 - 17 / 24, 2.5 + 0.75, 1],
    size: [8.5 / 12, 1.5, 17 / 12],
    facing: 'west',
  };
  const BOX = { position: TOWER.position, size: [17 / 12, 1.5, 8.5 / 12] as const };

  it('keeps every part within the Item box', () => {
    const { body, front, vents, strip, glass, feet } = towerBoxes(TOWER);
    for (const part of [body, front, ...vents, strip, glass, ...feet]) expect(within(part, BOX)).toBe(true);
  });

  it('stands on two feet, the body clear of the desk, the front panel flush with the west face', () => {
    const { body, front, feet } = towerBoxes(TOWER);
    expect(feet).toHaveLength(2);
    for (const foot of feet) expect(foot.position[1] - foot.size[1] / 2).toBeCloseTo(2.5);
    expect(body.position[1] - body.size[1] / 2).toBeGreaterThan(2.5);
    expect(front.position[0]).toBeLessThan(body.position[0] - body.size[0] / 2 + 0.01);
  });

  it('cuts air-vent slots across the front, standing a hair proud of the front panel', () => {
    const { front, vents } = towerBoxes(TOWER);
    expect(vents.length).toBeGreaterThanOrEqual(3);
    for (const vent of vents) {
      expect(vent.position[0] - vent.size[0] / 2).toBeLessThan(front.position[0] - front.size[0] / 2);
    }
    const heights = vents.map((vent) => vent.position[1]);
    expect(new Set(heights).size).toBe(vents.length); // one above the other
  });

  it('puts the accent strip on the front near the north edge, and dark glass on the north face', () => {
    const { body, strip, glass } = towerBoxes(TOWER);
    expect(strip.position[2]).toBeLessThan(TOWER.position[2]); // north is -z
    expect(glass.position[2]).toBeLessThan(body.position[2]);
    expect(glass.position[2] - glass.size[2] / 2).toBeCloseTo(TOWER.position[2] - 8.5 / 24);
  });
});

describe('keyboardBoxes', () => {
  const KEYBOARD: Item = {
    id: 'kb',
    type: 'keyboard',
    position: [4, 2.5 + 0.0625, 0],
    size: [17.5 / 12, 1.5 / 12, 5.5 / 12],
    facing: 'west',
  };
  const BOX = { position: KEYBOARD.position, size: [5.5 / 12, 1.5 / 12, 17.5 / 12] as const };

  it('keeps the body and every row of keys within the Item box', () => {
    const { body, rows } = keyboardBoxes(KEYBOARD);
    for (const part of [body, ...rows]) expect(within(part, BOX)).toBe(true);
  });

  it('lays five rows of keys on the body, inset from its edges', () => {
    const { body, rows } = keyboardBoxes(KEYBOARD);
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.position[1] - row.size[1] / 2).toBeCloseTo(body.position[1] + body.size[1] / 2);
      expect(row.size[2]).toBeLessThan(body.size[2]);
    }
  });

  it('leaves a gap between rows so the body shows through, back to front (east to west)', () => {
    const { rows } = keyboardBoxes(KEYBOARD);
    const ordered = [...rows].sort((a, b) => b.position[0] - a.position[0]);
    for (let i = 1; i < ordered.length; i++) {
      const behind = ordered[i - 1];
      const ahead = ordered[i];
      if (!behind || !ahead) throw new Error('expected rows');
      const gap = behind.position[0] - behind.size[0] / 2 - (ahead.position[0] + ahead.size[0] / 2);
      expect(gap).toBeGreaterThan(0.005);
    }
  });
});

describe('mouseBoxes', () => {
  const MOUSE: Item = {
    id: 'mouse',
    type: 'mouse',
    position: [4, 2.5 + 0.0625, 1],
    size: [2.5 / 12, 1.5 / 12, 4.7 / 12],
    facing: 'west',
  };
  const BOX = { position: MOUSE.position, size: [4.7 / 12, 1.5 / 12, 2.5 / 12] as const };

  it('keeps every part within the Item box, the tallest reaching its top', () => {
    const { shell, hump, buttons, wheel } = mouseBoxes(MOUSE);
    const parts = [shell, hump, ...buttons, wheel];
    for (const part of parts) expect(within(part, BOX)).toBe(true);
    const top = Math.max(...parts.map((part) => part.position[1] + part.size[1] / 2));
    expect(top).toBeCloseTo(2.5 + 1.5 / 12);
  });

  it('puts the hump at the back (east) and two buttons at the front (west) with a gap between them', () => {
    const { hump, buttons } = mouseBoxes(MOUSE);
    expect(buttons).toHaveLength(2);
    for (const button of buttons) expect(button.position[0]).toBeLessThan(hump.position[0]);
    const [a, b] = [...buttons].sort((p, q) => p.position[2] - q.position[2]);
    if (!a || !b) throw new Error('expected two buttons');
    expect(b.position[2] - b.size[2] / 2 - (a.position[2] + a.size[2] / 2)).toBeGreaterThan(0);
  });

  it('puts the scroll wheel on the centre line between the buttons, on top of the shell', () => {
    const { shell, wheel } = mouseBoxes(MOUSE);
    expect(wheel.position[2]).toBeCloseTo(MOUSE.position[2]);
    expect(wheel.position[1] - wheel.size[1] / 2).toBeCloseTo(shell.position[1] + shell.size[1] / 2);
  });
});

/** Extent (feet) of a box turned about the vertical axis, as a box that holds it. */
function yawedExtent(box: { position: Box['position']; size: Box['size']; yawRad: number }): Box {
  const [sx, sy, sz] = box.size;
  const cos = Math.abs(Math.cos(box.yawRad));
  const sin = Math.abs(Math.sin(box.yawRad));
  return { position: box.position, size: [sx * cos + sz * sin, sy, sx * sin + sz * cos] };
}

describe('chairBoxes', () => {
  // A 27 in square, 50 in tall chair at the desk, facing east: its back is on the west side.
  const CHAIR: Item = {
    id: 'chair',
    type: 'gaming-chair',
    position: [0, 25 / 12, 0],
    size: [27 / 12, 50 / 12, 27 / 12],
    facing: 'east',
  };
  const BOX = { position: CHAIR.position, size: CHAIR.size };
  const parts = () => {
    const c = chairBoxes(CHAIR);
    return {
      c,
      all: [
        ...c.base.map(yawedExtent),
        ...c.casters,
        c.column,
        c.seat,
        ...c.bolsters,
        c.back,
        c.headrest,
        ...c.wings,
        ...c.stripes,
        ...c.arms,
      ],
    };
  };

  it('keeps every part within the Item box', () => {
    for (const part of parts().all) expect(within(part, BOX)).toBe(true);
  });

  it('stands on a five-star base: legs 72° apart, one pointing to the front, each ending in a caster on the floor', () => {
    const { base, casters } = chairBoxes(CHAIR);
    expect(base).toHaveLength(5);
    expect(casters).toHaveLength(5);
    const angles = base
      .map((leg) => ((((-leg.yawRad * 180) / Math.PI) % 360) + 360) % 360)
      .sort((a, b) => a - b);
    angles.forEach((angle, i) => expect(angle).toBeCloseTo(i * 72, 5)); // 0° is east: the front
    for (const caster of casters) expect(caster.position[1] - caster.size[1] / 2).toBeCloseTo(0);
  });

  it('puts the backrest behind the seat (west, as the chair faces east), the headrest reaching the full height', () => {
    const { c } = parts();
    expect(c.back.position[0]).toBeLessThan(c.seat.position[0]);
    expect(c.headrest.position[1] + c.headrest.size[1] / 2).toBeCloseTo(50 / 12);
    expect(c.headrest.position[1] - c.headrest.size[1] / 2).toBeLessThan(
      c.back.position[1] + c.back.size[1] / 2,
    );
  });

  it('puts the seat on the column, a bolster and an armrest at each side of it', () => {
    const { c } = parts();
    expect(c.seat.position[1] - c.seat.size[1] / 2).toBeGreaterThanOrEqual(
      c.column.position[1] + c.column.size[1] / 2 - 1e-9,
    );
    const side = (box: Box) => Math.sign(box.position[2] - CHAIR.position[2]);
    for (const group of [c.bolsters, c.wings, c.arms]) {
      expect(group.map(side)).toContain(1);
      expect(group.map(side)).toContain(-1);
    }
  });

  it('puts two accent stripes on the backrest’s front (east) face, one each side of the middle', () => {
    const { stripes, back } = chairBoxes(CHAIR);
    expect(stripes).toHaveLength(2);
    for (const stripe of stripes) {
      expect(stripe.position[0]).toBeGreaterThan(back.position[0] + back.size[0] / 2 - 1e-9);
    }
    expect(stripes.map((stripe) => Math.sign(stripe.position[2] - CHAIR.position[2]))).toEqual([-1, 1]);
  });
});

// Headphones hung on the pegboard on the east wall, facing west.
const HEADPHONES: Item = {
  id: 'headphones',
  type: 'headphones',
  position: [5 - 1 / 12 - 3.5 / 24, 5.5, -2.8],
  size: [7 / 12, 8 / 12, 3.5 / 12],
  facing: 'west',
};

describe('headphonesBoxes', () => {
  it('keeps the band, both cups and the hook within the Item box', () => {
    const { band, cups, hook } = headphonesBoxes(HEADPHONES);
    const box = { position: HEADPHONES.position, size: [3.5 / 12, 8 / 12, 7 / 12] as const };
    for (const part of [band, hook, ...cups]) expect(within(part, box)).toBe(true);
  });

  it('puts a cup at each side, hanging below the band, with the hook behind at the top', () => {
    const { band, cups, hook } = headphonesBoxes(HEADPHONES);
    expect(cups).toHaveLength(2);
    const [north, south] = cups.map((cup) => cup.position[2]).sort((a, b) => (a ?? 0) - (b ?? 0));
    expect((north ?? 0) + (south ?? 0)).toBeCloseTo(2 * HEADPHONES.position[2]);
    for (const cup of cups) expect(cup.position[1] + cup.size[1] / 2).toBeLessThanOrEqual(band.position[1]);
    expect(hook.position[0]).toBeGreaterThan(band.position[0]); // towards the wall (east)
  });
});

// A picture frame on the south wall (z = 4.5), facing north.
const FRAME: Item = {
  id: 'frame-1',
  type: 'frame',
  position: [-2, 4.75, 4.5 - 1 / 24],
  size: [1, 1.5, 1 / 12],
  facing: 'north',
};

describe('frameBoxes', () => {
  it('keeps the body, art and accent line within the Item box', () => {
    const { body, art, line } = frameBoxes(FRAME);
    const box = { position: FRAME.position, size: [1, 1.5, 1 / 12] as const };
    for (const part of [body, art, line]) expect(within(part, box)).toBe(true);
  });

  it('puts the art on the frame’s front, north of the frame body, leaving a border', () => {
    const { body, art } = frameBoxes(FRAME);
    expect(art.position[2]).toBeLessThan(body.position[2]);
    expect(art.size[0]).toBeLessThan(FRAME.size[0]);
    expect(art.size[1]).toBeLessThan(FRAME.size[1]);
  });

  it('puts the accent line across the art, in front of it', () => {
    const { art, line } = frameBoxes(FRAME);
    expect(line.position[2]).toBeLessThan(art.position[2]);
    expect(line.size[0]).toBeLessThan(art.size[0]);
  });
});
