import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { hiddenSurfaces } from './cutaway';
import { VIEWS } from './views';

describe('hiddenSurfaces', () => {
  it('hides the walls and ceiling facing the overview camera', () => {
    expect(hiddenSurfaces(ASHERS_ROOM, VIEWS.overview.position)).toEqual({
      walls: ['east', 'south'],
      ceiling: true,
    });
  });

  it('hides nothing from a camera inside the room', () => {
    expect(hiddenSurfaces(ASHERS_ROOM, [1, 5, -2])).toEqual({ walls: [], ceiling: false });
  });
});
