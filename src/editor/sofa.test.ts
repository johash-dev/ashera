import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { itemBox } from './items';
import { sofaItems } from './sofa';

const sofa = () => {
  const found = sofaItems(ASHERS_ROOM).find((i) => i.type === 'sofa-compact');
  if (!found) throw new Error('no compact sofa in the starter arrangement');
  return found;
};

const edges = () => {
  const { position, size } = itemBox(sofa());
  return {
    west: position[0] - size[0] / 2,
    east: position[0] + size[0] / 2,
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    bottom: position[1] - size[1] / 2,
    top: position[1] + size[1] / 2,
  };
};

describe('sofaItems: the compact sofa', () => {
  it('uses the Catalog size: 5½ ft wide, 2½ ft high, 3 ft deep', () => {
    expect(sofa().size).toEqual([5.5, 2.5, 3]);
    expect(sofa().size).toEqual(CATALOG['sofa-compact'].size);
  });

  it('stands on the floor against the south wall, facing north towards the TV', () => {
    expect(sofa().facing).toBe('north');
    expect(edges().bottom).toBe(0);
    expect(edges().south).toBe(floorBounds(ASHERS_ROOM).maxZ);
  });

  it('starts in the window corner, its west end on the window wall face', () => {
    expect(edges().west).toBe(floorBounds(ASHERS_ROOM).minX);
  });

  it('ends west of the doorway', () => {
    const doorway = ASHERS_ROOM.openings.find((o) => o.id === 'doorway');
    if (!doorway) throw new Error('no doorway');
    const { maxX } = floorBounds(ASHERS_ROOM);
    expect(edges().east).toBeLessThan(maxX - doorway.width);
  });

  it('stays below the window sill', () => {
    const window = ASHERS_ROOM.openings.find((o) => o.id === 'window');
    if (!window) throw new Error('no window');
    expect(edges().top).toBeLessThan(window.sill);
  });
});
