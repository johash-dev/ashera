import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { itemBox } from './items';
import { tvStandFront } from './tvWall';

const desk = () => {
  const found = deskItems(ASHERS_ROOM).find((i) => i.type === 'desk');
  if (!found) throw new Error('no desk in the starter arrangement');
  return found;
};

describe('deskItems: the desk', () => {
  it('uses the desk from the Catalog: 4 ft wide, 2 ft deep, top 30 in high', () => {
    expect(desk().size).toEqual([4, 2.5, 2]);
    expect(desk().size).toEqual(CATALOG.desk.size);
  });

  it('stands on the floor against the east wall, facing west', () => {
    const { maxX } = floorBounds(ASHERS_ROOM);
    const { position, size } = itemBox(desk());
    expect(desk().facing).toBe('west');
    expect(position[1] - size[1] / 2).toBe(0);
    expect(position[0] + size[0] / 2).toBe(maxX);
    expect(size[2]).toBe(4); // its 4 ft run along the east wall
  });

  it('starts its north end level with the TV stand’s front', () => {
    const { position, size } = itemBox(desk());
    expect(position[2] - size[2] / 2).toBeCloseTo(tvStandFront(ASHERS_ROOM));
  });
});
