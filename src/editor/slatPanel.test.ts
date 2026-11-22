import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { SLAT_PANEL } from './catalog';
import { slatPanelBacking, slatPanelCutouts, slatPanelSlats } from './slatPanel';

const { minX, maxX, minZ } = floorBounds(ASHERS_ROOM);
const slats = slatPanelSlats(ASHERS_ROOM);
const cutouts = slatPanelCutouts(ASHERS_ROOM);
const left = (b: { position: readonly number[]; size: readonly number[] }) =>
  (b.position[0] ?? 0) - (b.size[0] ?? 0) / 2;
const right = (b: { position: readonly number[]; size: readonly number[] }) =>
  (b.position[0] ?? 0) + (b.size[0] ?? 0) / 2;

describe('SLAT_PANEL', () => {
  it('is a typical acoustic slat panel: 1 in slats, ½ in gaps, ¾ in deep', () => {
    expect(SLAT_PANEL.slatWidth * 12).toBeCloseTo(1);
    expect(SLAT_PANEL.gap * 12).toBeCloseTo(0.5);
    expect(SLAT_PANEL.depth * 12).toBeCloseTo(0.75);
  });
});

describe('slatPanelCutouts', () => {
  it('has one cut-out per TV-wall Fitting, around its plate', () => {
    const fittings = ASHERS_ROOM.fittings.filter((f) => f.surface === 'north');
    expect(cutouts).toHaveLength(fittings.length);
    for (const [i, fitting] of fittings.entries()) {
      const cut = cutouts[i];
      if (!cut) throw new Error('missing cut-out');
      const plateX = minX + fitting.centre[0];
      expect(cut.minX).toBeLessThan(plateX - fitting.size[0] / 2);
      expect(cut.maxX).toBeGreaterThan(plateX + fitting.size[0] / 2);
      expect(cut.minY).toBeLessThan(fitting.centre[1] - fitting.size[1] / 2);
      expect(cut.maxY).toBeGreaterThan(fitting.centre[1] + fitting.size[1] / 2);
    }
  });
});

describe('slatPanelSlats', () => {
  const columns = [...new Set(slats.map((s) => s.position[0]))].sort((a, b) => a - b);

  it('covers the TV wall corner to corner: 80 slat columns 1.5 in apart, centred', () => {
    expect(columns).toHaveLength(80);
    for (let i = 1; i < columns.length; i++) {
      expect((columns[i] ?? 0) - (columns[i - 1] ?? 0)).toBeCloseTo(SLAT_PANEL.slatWidth + SLAT_PANEL.gap);
    }
    const first = slats.find((s) => s.position[0] === columns[0]);
    const last = slats.find((s) => s.position[0] === columns.at(-1));
    if (!first || !last) throw new Error('no slats');
    expect(left(first)).toBeGreaterThanOrEqual(minX);
    expect(right(last)).toBeLessThanOrEqual(maxX);
    expect(left(first) - minX).toBeCloseTo(maxX - right(last));
  });

  it('runs each slat from the floor to the ceiling where no cut-out crosses it', () => {
    const clear = slats.filter((s) => !cutouts.some((c) => left(s) < c.maxX && right(s) > c.minX));
    expect(clear.length).toBeGreaterThan(70);
    for (const s of clear) {
      expect(s.position[1] - s.size[1] / 2).toBeCloseTo(0);
      expect(s.position[1] + s.size[1] / 2).toBeCloseTo(ASHERS_ROOM.ceilingHeight);
    }
  });

  it('leaves every cut-out open, and fills the rest of each slat column crossing it', () => {
    for (const cut of cutouts) {
      const crossing = slats.filter((s) => left(s) < cut.maxX && right(s) > cut.minX);
      expect(crossing.length).toBeGreaterThan(0);
      for (const s of crossing) {
        const bottom = s.position[1] - s.size[1] / 2;
        const top = s.position[1] + s.size[1] / 2;
        expect(top <= cut.minY + 1e-9 || bottom >= cut.maxY - 1e-9).toBe(true);
      }
      const height = (x: number) =>
        slats.filter((s) => s.position[0] === x).reduce((sum, s) => sum + s.size[1], 0);
      const x = crossing[0]?.position[0] ?? 0;
      // Cut-outs never overlap in height, so the column loses exactly the height of each one it crosses.
      const first = crossing[0];
      if (!first) throw new Error('no crossing slat');
      const lost = cutouts
        .filter((c) => left(first) < c.maxX && right(first) > c.minX)
        .reduce((sum, c) => sum + (c.maxY - c.minY), 0);
      expect(height(x)).toBeCloseTo(ASHERS_ROOM.ceilingHeight - lost);
    }
  });

  it('stands on the TV wall, its slats making up the front of the panel', () => {
    for (const s of slats) {
      expect(s.position[2] + s.size[2] / 2).toBeCloseTo(minZ + SLAT_PANEL.depth);
      expect(s.size[0]).toBeCloseTo(SLAT_PANEL.slatWidth);
    }
  });
});

describe('slatPanelBacking', () => {
  const backing = slatPanelBacking(ASHERS_ROOM);

  it('sits against the TV wall behind the slats, filling the gaps between them', () => {
    for (const b of backing) {
      expect(b.position[2] - b.size[2] / 2).toBeCloseTo(minZ);
      expect(b.position[2] + b.size[2] / 2).toBeCloseTo(minZ + SLAT_PANEL.backingDepth);
      expect(b.size[0]).toBeCloseTo(SLAT_PANEL.slatWidth + SLAT_PANEL.gap);
    }
  });

  it('leaves every cut-out open', () => {
    for (const cut of cutouts)
      for (const b of backing.filter((p) => left(p) < cut.maxX && right(p) > cut.minX)) {
        const bottom = b.position[1] - b.size[1] / 2;
        const top = b.position[1] + b.size[1] / 2;
        expect(top <= cut.minY + 1e-9 || bottom >= cut.maxY - 1e-9).toBe(true);
      }
  });
});
