import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { CATALOG, type ItemTypeId } from './catalog';
import { itemBox, type Item } from './items';
import { SOFA_CHOICES, sofaFromSearch, sofaItems } from './sofa';

const itemOfType = (items: Item[], type: ItemTypeId) => {
  const found = items.find((i) => i.type === type);
  if (!found) throw new Error(`no ${type} in the sofa Items`);
  return found;
};

const edges = (item: Item) => {
  const { position, size } = itemBox(item);
  return {
    west: position[0] - size[0] / 2,
    east: position[0] + size[0] / 2,
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    bottom: position[1] - size[1] / 2,
    top: position[1] + size[1] / 2,
  };
};

const doorway = () => {
  const found = ASHERS_ROOM.openings.find((o) => o.id === 'doorway');
  if (!found) throw new Error('no doorway');
  return found;
};
const windowOpening = () => {
  const found = ASHERS_ROOM.openings.find((o) => o.id === 'window');
  if (!found) throw new Error('no window');
  return found;
};

describe.each(SOFA_CHOICES)('sofaItems: the %s sofa', (choice) => {
  const items = sofaItems(ASHERS_ROOM, choice);
  const long = () => itemOfType(items, choice === 'compact' ? 'sofa-compact' : 'sofa-l-long');

  it('has a long side with the Catalog size: 5½ ft wide, 2½ ft high, 3 ft deep', () => {
    expect(long().size).toEqual([5.5, 2.5, 3]);
    expect(long().size).toEqual(CATALOG[long().type].size);
  });

  it('stands the long side on the floor against the south wall, facing north towards the TV', () => {
    expect(long().facing).toBe('north');
    expect(edges(long()).bottom).toBe(0);
    expect(edges(long()).south).toBe(floorBounds(ASHERS_ROOM).maxZ);
  });

  it('starts in the window corner, its west end on the window wall face', () => {
    expect(edges(long()).west).toBe(floorBounds(ASHERS_ROOM).minX);
  });

  it('ends west of the doorway', () => {
    expect(edges(long()).east).toBeLessThan(floorBounds(ASHERS_ROOM).maxX - doorway().width);
  });

  it.each(items.map((item) => item.type))('keeps the %s below the window sill', (type) => {
    expect(edges(itemOfType(items, type)).top).toBeLessThan(windowOpening().sill);
  });
});

describe('sofaItems: the compact sofa is one Item', () => {
  it('lists only the compact sofa', () => {
    expect(sofaItems(ASHERS_ROOM, 'compact').map((i) => i.type)).toEqual(['sofa-compact']);
  });
});

describe('sofaItems: the L-shaped sofa', () => {
  const items = sofaItems(ASHERS_ROOM, 'l');
  const long = () => itemOfType(items, 'sofa-l-long');
  const short = () => itemOfType(items, 'sofa-l-short');

  it('is a long side and a short side', () => {
    expect(items.map((i) => i.type)).toEqual(['sofa-l-long', 'sofa-l-short']);
  });

  it('puts the short side on the window wall face, facing east, with the Catalog size', () => {
    expect(short().facing).toBe('east');
    expect(short().size).toEqual(CATALOG['sofa-l-short'].size);
    expect(edges(short()).west).toBe(floorBounds(ASHERS_ROOM).minX);
    expect(edges(short()).bottom).toBe(0);
  });

  it('has the short side touching the long side’s front at the corner', () => {
    expect(edges(short()).south).toBeCloseTo(edges(long()).north);
  });

  it('runs 5 ft up the window wall overall, 3 ft deep', () => {
    const { maxZ } = floorBounds(ASHERS_ROOM);
    expect(maxZ - edges(short()).north).toBeCloseTo(5);
    expect(edges(short()).east - edges(short()).west).toBeCloseTo(3);
  });
});

describe('sofaFromSearch', () => {
  it('reads ?sofa=l', () => {
    expect(sofaFromSearch('?sofa=l')).toBe('l');
  });

  it('reads ?sofa=compact', () => {
    expect(sofaFromSearch('?view=top&sofa=compact')).toBe('compact');
  });

  it('gives the compact sofa when missing or unknown', () => {
    expect(sofaFromSearch('')).toBe('compact');
    expect(sofaFromSearch('?sofa=corner')).toBe('compact');
  });
});
