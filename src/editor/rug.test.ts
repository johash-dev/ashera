import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { clearOfDoorSwing, itemBox } from './items';
import { rugItems } from './rug';
import { tvStandFront } from './tvWall';

const rug = () => {
  const found = rugItems(ASHERS_ROOM).find((i) => i.type === 'rug');
  if (!found) throw new Error('no rug in the starter arrangement');
  return found;
};

const edges = () => {
  const { position, size } = itemBox(rug());
  return {
    west: position[0] - size[0] / 2,
    east: position[0] + size[0] / 2,
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    bottom: position[1] - size[1] / 2,
  };
};

describe('rugItems: the rug', () => {
  it('uses the Catalog size: 5 ft west–east, ½ in thick, 3½ ft north–south', () => {
    expect(rug().size).toEqual([5, 0.5 / 12, 3.5]);
    expect(rug().size).toEqual(CATALOG.rug.size);
    expect(edges().east - edges().west).toBeCloseTo(5);
    expect(edges().south - edges().north).toBeCloseTo(3.5);
  });

  it('lies on the floor', () => {
    expect(edges().bottom).toBe(0);
  });

  it('has its east edge level with the desk’s front, under the gaming chair', () => {
    const desk = deskItems(ASHERS_ROOM).find((i) => i.type === 'desk');
    if (!desk) throw new Error('no desk');
    const { position, size } = itemBox(desk);
    expect(edges().east).toBeCloseTo(position[0] - size[0] / 2);
  });

  it('is centred north–south between the TV stand’s front and the compact sofa’s front', () => {
    const sofaFront = floorBounds(ASHERS_ROOM).maxZ - CATALOG['sofa-compact'].size[2];
    expect((edges().north + edges().south) / 2).toBeCloseTo((tvStandFront(ASHERS_ROOM) + sofaFront) / 2);
  });

  it('stays inside the Room and out of the Door swing', () => {
    const { minX, maxX, minZ, maxZ } = floorBounds(ASHERS_ROOM);
    expect(edges().west).toBeGreaterThanOrEqual(minX);
    expect(edges().east).toBeLessThanOrEqual(maxX);
    expect(edges().north).toBeGreaterThanOrEqual(minZ);
    expect(edges().south).toBeLessThanOrEqual(maxZ);
    expect(clearOfDoorSwing(ASHERS_ROOM, rug())).toBe(true);
  });
});
