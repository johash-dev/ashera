import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, type Room } from '../room';
import { hiddenSurfaces } from './cutaway';
import { cameraViews, DEFAULT_VIEW, EYE_HEIGHT, VIEW_ORDER, type ViewId, viewFromSearch } from './views';

const VIEWS = cameraViews(ASHERS_ROOM);
const PHOTO_VIEWS: ViewId[] = ['entrance', 'window', 'left', 'right'];

describe('viewFromSearch', () => {
  it('returns the requested preset', () => {
    expect(viewFromSearch(VIEWS, '?view=top')).toBe(VIEWS.top);
  });

  it('falls back to the default for missing or unknown views', () => {
    expect(viewFromSearch(VIEWS, '')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch(VIEWS, '?view=nope')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch(VIEWS, '?view=toString')).toBe(VIEWS[DEFAULT_VIEW]);
  });
});

describe('VIEW_ORDER', () => {
  it('lists every View once, overview first, photo Views last', () => {
    expect(VIEW_ORDER).toEqual(['overview', 'top', ...PHOTO_VIEWS]);
  });
});

describe('photo Views', () => {
  const facing = (
    views: Record<ViewId, { position: readonly number[]; target: readonly number[] }>,
    id: ViewId,
  ) => {
    const { position, target } = views[id];
    const [dx, dz] = [(target[0] ?? 0) - (position[0] ?? 0), (target[2] ?? 0) - (position[2] ?? 0)];
    if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? 'east' : 'west';
    return dz > 0 ? 'south' : 'north';
  };

  it('stand inside the Room at eye height, so Cutaway hides nothing', () => {
    for (const id of PHOTO_VIEWS) {
      expect(VIEWS[id].position[1]).toBe(EYE_HEIGHT);
      expect(hiddenSurfaces(ASHERS_ROOM, VIEWS[id].position)).toEqual({ walls: [], ceiling: false });
    }
  });

  it('each face the Wall in its photo', () => {
    expect(PHOTO_VIEWS.map((id) => facing(VIEWS, id))).toEqual(['north', 'west', 'south', 'east']);
  });

  it('stands Entrance inside the doorway (x 1.92 to 5 on the south Wall)', () => {
    const [x, , z] = VIEWS.entrance.position;
    expect(x).toBeGreaterThan(5 - 37 / 12);
    expect(x).toBeLessThan(5);
    expect(z).toBeLessThan(4.5);
  });

  it('follows the Room: a shallower Room still has every camera inside it', () => {
    const shallow: Room = { ...ASHERS_ROOM, depth: 7 };
    const views = cameraViews(shallow);
    for (const id of PHOTO_VIEWS) {
      expect(hiddenSurfaces(shallow, views[id].position)).toEqual({ walls: [], ceiling: false });
    }
    expect(PHOTO_VIEWS.map((id) => facing(views, id))).toEqual(['north', 'west', 'south', 'east']);
  });
});
