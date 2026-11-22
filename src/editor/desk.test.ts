import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { CATALOG, type ItemTypeId } from './catalog';
import { deskItems } from './desk';
import { itemBox } from './items';
import { tvStandFront } from './tvWall';

const itemOfType = (type: ItemTypeId) => {
  const found = deskItems(ASHERS_ROOM).find((i) => i.type === type);
  if (!found) throw new Error(`no ${type} at the desk`);
  return found;
};
const desk = () => itemOfType('desk');
/** The four Items that stand on the desk top. */
const ON_DESK: readonly ItemTypeId[] = ['monitor', 'pc-tower', 'keyboard', 'mouse'];

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

describe('deskItems: what is on the desk', () => {
  const deskBox = () => itemBox(desk());
  const edges = (type: ItemTypeId) => {
    const { position, size } = itemBox(itemOfType(type));
    return {
      west: position[0] - size[0] / 2,
      east: position[0] + size[0] / 2,
      north: position[2] - size[2] / 2,
      south: position[2] + size[2] / 2,
      bottom: position[1] - size[1] / 2,
      centreZ: position[2],
    };
  };
  const deskEdges = () => {
    const { position, size } = deskBox();
    return {
      west: position[0] - size[0] / 2,
      east: position[0] + size[0] / 2,
      north: position[2] - size[2] / 2,
      south: position[2] + size[2] / 2,
      top: position[1] + size[1] / 2,
      centreZ: position[2],
    };
  };

  it.each(ON_DESK)('rests the %s on the desk top, within it, with the Catalog size', (type) => {
    const item = edges(type);
    const top = deskEdges();
    expect(itemOfType(type).size).toEqual(CATALOG[type].size);
    expect(item.bottom).toBeCloseTo(top.top);
    expect(item.west).toBeGreaterThanOrEqual(top.west);
    expect(item.east).toBeLessThanOrEqual(top.east);
    expect(item.north).toBeGreaterThanOrEqual(top.north);
    expect(item.south).toBeLessThanOrEqual(top.south);
  });

  it('faces the monitor, tower, keyboard and mouse west, towards Asher', () => {
    for (const type of ON_DESK) expect(itemOfType(type).facing).toBe('west');
  });

  it('centres the monitor on the desk with its back to the wall', () => {
    expect(edges('monitor').centreZ).toBeCloseTo(deskEdges().centreZ);
    expect(edges('monitor').east).toBeCloseTo(deskEdges().east);
  });

  it('puts the keyboard in front of the monitor, centred on it', () => {
    expect(edges('keyboard').east).toBeLessThan(edges('monitor').west);
    expect(edges('keyboard').centreZ).toBeCloseTo(edges('monitor').centreZ);
  });

  it('puts the mouse to the right of the keyboard (south, as Asher faces east), clear of it', () => {
    expect(edges('mouse').north).toBeGreaterThan(edges('keyboard').south);
  });

  it('puts the PC tower at the desk’s south end, clear of the monitor', () => {
    expect(edges('pc-tower').north).toBeGreaterThan(edges('monitor').south);
    expect(edges('pc-tower').south).toBeLessThan(deskEdges().south);
    expect(edges('pc-tower').north).toBeGreaterThan(deskEdges().centreZ);
  });
});

describe('deskItems: the gaming chair', () => {
  const chair = () => itemOfType('gaming-chair');

  it('stands on the floor facing east, with the Catalog size', () => {
    const { position, size } = itemBox(chair());
    expect(chair().facing).toBe('east');
    expect(chair().size).toEqual(CATALOG['gaming-chair'].size);
    expect(position[1] - size[1] / 2).toBe(0);
  });

  it('is centred on the desk with its front touching the desk’s front', () => {
    const chairBox = itemBox(chair());
    const deskBox = itemBox(desk());
    expect(chairBox.position[2]).toBeCloseTo(deskBox.position[2]);
    expect(chairBox.position[0] + chairBox.size[0] / 2).toBeCloseTo(
      deskBox.position[0] - deskBox.size[0] / 2,
    );
  });
});
