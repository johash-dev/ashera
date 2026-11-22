import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from '../room';
import { hiddenSurfaces } from './cutaway';
import { DEFAULT_VIEW, EYE_HEIGHT, PHOTO_VIEWS, type ViewId, VIEWS, viewFromSearch } from './views';

describe('viewFromSearch', () => {
  it('returns the requested preset', () => {
    expect(viewFromSearch('?view=top')).toBe(VIEWS.top);
  });

  it('falls back to the default for missing or unknown views', () => {
    expect(viewFromSearch('')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch('?view=nope')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch('?view=toString')).toBe(VIEWS[DEFAULT_VIEW]);
  });
});

describe('photo Views', () => {
  const photoViews = PHOTO_VIEWS.map((id) => VIEWS[id]);

  it('are the four reference-photo standpoints, in Header order', () => {
    expect(PHOTO_VIEWS).toEqual(['entrance', 'window', 'left', 'right']);
  });

  it('stand inside the Room at eye height, so Cutaway hides nothing', () => {
    for (const view of photoViews) {
      expect(view.position[1]).toBe(EYE_HEIGHT);
      expect(hiddenSurfaces(ASHERS_ROOM, view.position)).toEqual({ walls: [], ceiling: false });
    }
  });

  it('each face the Wall in its photo', () => {
    const facing = (id: ViewId) => {
      const { position, target } = VIEWS[id];
      const [dx, dz] = [target[0] - position[0], target[2] - position[2]];
      if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? 'east' : 'west';
      return dz > 0 ? 'south' : 'north';
    };
    expect(PHOTO_VIEWS.map(facing)).toEqual(['north', 'west', 'south', 'east']);
  });
});
