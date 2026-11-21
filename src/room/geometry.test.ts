import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from './room.config';
import { clearHeightAtWall, floorBounds, validateRoom, wallLength } from './geometry';
import type { Fitting, Room } from './types';

describe("Asher's room config", () => {
  it('is physically consistent', () => {
    expect(validateRoom(ASHERS_ROOM)).toEqual([]);
  });

  it('matches the measured footprint (10 ft × 9 ft, 9.5 ft ceiling)', () => {
    expect(wallLength(ASHERS_ROOM, 'north')).toBe(10);
    expect(wallLength(ASHERS_ROOM, 'west')).toBe(9);
    expect(ASHERS_ROOM.ceilingHeight).toBe(9.5);
  });

  it('has the measured doorway (3′ 1″ × 7′ 2″) and window (5′ 9″ × 5′ 6″)', () => {
    const find = (id: string) => ASHERS_ROOM.openings.find((o) => o.id === id);
    expect(find('doorway')).toMatchObject({ width: 37 / 12, height: 43 / 12, placeholder: false });
    expect(find('window')).toMatchObject({ width: 5.75, height: 5.5, offset: 1.625, sill: 3.5 });
  });

  it('has no beam on the north (TV) wall', () => {
    expect(clearHeightAtWall(ASHERS_ROOM, 'north')).toBe(9.5);
    expect(clearHeightAtWall(ASHERS_ROOM, 'west')).toBe(9);
  });
});

describe('floorBounds', () => {
  it('centres the footprint on the origin', () => {
    expect(floorBounds(ASHERS_ROOM)).toEqual({ minX: -5, maxX: 5, minZ: -4.5, maxZ: 4.5 });
  });
});

describe('validateRoom', () => {
  const withOpenings = (openings: Room['openings']): Room => ({ ...ASHERS_ROOM, openings, doors: [] });

  it('rejects an opening that runs past the end of its wall', () => {
    const problems = validateRoom(
      withOpenings([
        {
          id: 'w',
          kind: 'window',
          wall: 'west',
          offset: 6,
          width: 4,
          height: 2,
          sill: 3,
          placeholder: false,
        },
      ]),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/does not fit/);
  });

  it('rejects an opening that rises into the beam', () => {
    const problems = validateRoom(
      withOpenings([
        {
          id: 'w',
          kind: 'window',
          wall: 'west',
          offset: 1,
          width: 2,
          height: 6,
          sill: 3.5,
          placeholder: false,
        },
      ]),
    );
    expect(problems[0]).toMatch(/above the clear height/);
  });

  it('rejects overlapping openings on the same wall', () => {
    const problems = validateRoom(
      withOpenings([
        {
          id: 'a',
          kind: 'window',
          wall: 'east',
          offset: 1,
          width: 3,
          height: 2,
          sill: 3,
          placeholder: false,
        },
        {
          id: 'b',
          kind: 'window',
          wall: 'east',
          offset: 3,
          width: 3,
          height: 2,
          sill: 3,
          placeholder: false,
        },
      ]),
    );
    expect(problems.some((p) => p.includes('overlap'))).toBe(true);
  });

  it('rejects a door pointing at a missing opening', () => {
    const room: Room = {
      ...ASHERS_ROOM,
      doors: [
        {
          id: 'd',
          openingId: 'nope',
          hinge: 'start',
          swingsInward: true,
          thickness: 0.125,
          placeholder: false,
        },
      ],
    };
    expect(validateRoom(room).some((p) => p.includes('missing opening'))).toBe(true);
  });

  it('rejects a skirting depth that is not positive', () => {
    const room: Room = { ...ASHERS_ROOM, skirting: { ...ASHERS_ROOM.skirting, depth: 0 } };
    expect(validateRoom(room).some((p) => p.includes('Skirting depth'))).toBe(true);
  });

  it('rejects a door thickness that is not positive', () => {
    const [door] = ASHERS_ROOM.doors;
    if (!door) throw new Error('config has no door');
    const room: Room = { ...ASHERS_ROOM, doors: [{ ...door, thickness: 0 }] };
    expect(validateRoom(room).some((p) => p.includes('thickness'))).toBe(true);
  });

  describe('Fittings', () => {
    const plate: Fitting = {
      id: 'f',
      kind: 'switch-plate',
      surface: 'east',
      centre: [4.5, 4],
      size: [0.28, 0.28],
      placeholder: false,
    };
    const withFitting = (fitting: Fitting): Room => ({ ...ASHERS_ROOM, fittings: [fitting] });
    const outside = (fitting: Fitting) =>
      validateRoom(withFitting(fitting)).some((p) => p.includes(`Fitting "f"`));

    it('accepts a plate inside its Wall', () => {
      expect(outside(plate)).toBe(false);
    });

    it('rejects a plate running past the end of its Wall', () => {
      expect(outside({ ...plate, centre: [8.9, 4] })).toBe(true);
    });

    it('rejects a plate rising into the Beam', () => {
      expect(outside({ ...plate, centre: [4.5, 8.9] })).toBe(true);
    });

    it('rejects a ceiling plate outside the ceiling', () => {
      expect(outside({ ...plate, surface: 'ceiling', centre: [9.5, 4.5], size: [2, 2] })).toBe(true);
    });
  });

  it('rejects a wall thickness that is not positive', () => {
    const room: Room = { ...ASHERS_ROOM, walls: { thickness: 0, placeholder: false } };
    expect(validateRoom(room).some((p) => p.includes('thickness'))).toBe(true);
  });
});
