import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from './room.config';
import { clearHeightAtWall, floorBounds, validateRoom, wallLength } from './geometry';
import type { Room } from './types';

describe("Asher's room config", () => {
  it('is physically consistent', () => {
    expect(validateRoom(ASHERS_ROOM)).toEqual([]);
  });

  it('matches the measured footprint (10 ft × 9 ft, 9.5 ft ceiling)', () => {
    expect(wallLength(ASHERS_ROOM, 'north')).toBe(10);
    expect(wallLength(ASHERS_ROOM, 'west')).toBe(9);
    expect(ASHERS_ROOM.ceilingHeight).toBe(9.5);
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
      doors: [{ id: 'd', openingId: 'nope', hinge: 'start', swingsInward: true }],
    };
    expect(validateRoom(room).some((p) => p.includes('missing opening'))).toBe(true);
  });

  it('rejects a wall thickness that is not positive', () => {
    const room: Room = { ...ASHERS_ROOM, walls: { thickness: 0, placeholder: false } };
    expect(validateRoom(room).some((p) => p.includes('thickness'))).toBe(true);
  });
});
