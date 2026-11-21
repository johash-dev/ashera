import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, type Fitting } from '../room';
import { fittingPlate, type Plate } from './fittingPlates';

/** Rounds to 4 decimals so float sums compare exactly. */
const round = (n: number) => Math.round(n * 1e4) / 1e4;
const rounded = ({ position, rotation, size }: Plate): Plate => ({
  position: [round(position[0]), round(position[1]), round(position[2])],
  rotation: [round(rotation[0]), round(rotation[1]), round(rotation[2])],
  size,
});

const fitting = (id: string): Fitting => {
  const found = ASHERS_ROOM.fittings.find((f) => f.id === id);
  if (!found) throw new Error(`config has no fitting "${id}"`);
  return found;
};

describe('fittingPlate', () => {
  it('lies just off the north Wall, facing into the Room', () => {
    expect(rounded(fittingPlate(ASHERS_ROOM, fitting('tv-socket')))).toEqual({
      position: [-0.9, 1, -4.49],
      rotation: [0, 0, 0],
      size: [0.48, 0.28],
    });
  });

  it('measures along the south Wall from its south-east corner', () => {
    expect(rounded(fittingPlate(ASHERS_ROOM, fitting('door-switch')))).toEqual({
      position: [0.8, 4.2, 4.49],
      rotation: [0, round(Math.PI), 0],
      size: [0.28, 0.28],
    });
  });

  it('faces west on the east Wall', () => {
    const plate = fittingPlate(ASHERS_ROOM, { ...fitting('door-switch'), surface: 'east', centre: [2, 4] });
    expect(rounded(plate)).toEqual({
      position: [4.99, 4, -2.5],
      rotation: [0, round(-Math.PI / 2), 0],
      size: [0.28, 0.28],
    });
  });

  it('hangs just below the ceiling, facing down, measured from the north-west corner', () => {
    expect(rounded(fittingPlate(ASHERS_ROOM, fitting('ceiling-light')))).toEqual({
      position: [0, 9.49, 0],
      rotation: [round(Math.PI / 2), 0, 0],
      size: [2, 2],
    });
  });
});
