import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { doorSwing } from './doorSwing';

const [DOOR] = ASHERS_ROOM.doors;
if (!DOOR) throw new Error('config has no door');
const RADIUS = 37 / 12; // the doorway width, 3′ 1″

describe('doorSwing', () => {
  const swing = doorSwing(ASHERS_ROOM, DOOR);

  it('swings on a radius equal to the doorway width', () => {
    expect(swing.radius).toBeCloseTo(RADIUS);
  });

  it('is hinged at the south-east corner of the interior', () => {
    expect(swing.hinge).toEqual([5, 4.5]);
  });

  it('sweeps from the doorway to the east Wall', () => {
    const first = swing.arc[0];
    const last = swing.arc[swing.arc.length - 1];
    if (!first || !last) throw new Error('empty arc');
    expect(first[0]).toBeCloseTo(5 - RADIUS); // the closed leaf's free end, across the doorway
    expect(first[1]).toBeCloseTo(4.5);
    expect(last[0]).toBeCloseTo(5); // the open leaf's free end, against the east Wall
    expect(last[1]).toBeCloseTo(4.5 - RADIUS);
  });

  it('stays a constant distance from the hinge and inside the Room', () => {
    for (const [x, z] of swing.arc) {
      expect(Math.hypot(x - 5, z - 4.5)).toBeCloseTo(RADIUS);
      expect(x).toBeLessThanOrEqual(5 + 1e-9);
      expect(z).toBeLessThanOrEqual(4.5 + 1e-9);
    }
  });

  it('mirrors when the hinge is on the far side of the doorway', () => {
    const mirrored = doorSwing(ASHERS_ROOM, { ...DOOR, hinge: 'end' });
    expect(mirrored.hinge[0]).toBeCloseTo(5 - RADIUS);
    expect(mirrored.hinge[1]).toBeCloseTo(4.5);
    expect(mirrored.openEnd[0]).toBeCloseTo(5 - RADIUS);
    expect(mirrored.openEnd[1]).toBeCloseTo(4.5 - RADIUS);
    const mid = mirrored.arc[Math.floor(mirrored.arc.length / 2)];
    if (!mid) throw new Error('empty arc');
    expect(mid[1]).toBeLessThan(4.5); // sweeps into the Room, not out of it
  });
});
