import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, clearHeightAtWall, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { clearOfDoorSwing, itemBox } from './items';
import { wallDecorItems } from './wallDecor';

const pegboard = () => {
  const found = wallDecorItems(ASHERS_ROOM).find((i) => i.type === 'pegboard');
  if (!found) throw new Error('no pegboard in the starter arrangement');
  return found;
};

const edges = () => {
  const { position, size } = itemBox(pegboard());
  return {
    west: position[0] - size[0] / 2,
    east: position[0] + size[0] / 2,
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    bottom: position[1] - size[1] / 2,
    top: position[1] + size[1] / 2,
  };
};

const deskPart = (type: 'desk' | 'monitor') => {
  const found = deskItems(ASHERS_ROOM).find((i) => i.type === type);
  if (!found) throw new Error(`no ${type} at the desk`);
  const { position, size } = itemBox(found);
  return {
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    top: position[1] + size[1] / 2,
  };
};

describe('wallDecorItems: the pegboard', () => {
  it('uses the Catalog size: 4 ft wide, 2 ft tall, 1 in deep', () => {
    expect(pegboard().size).toEqual([4, 2, 1 / 12]);
    expect(pegboard().size).toEqual(CATALOG.pegboard.size);
  });

  it('hangs on the east wall face, facing west', () => {
    expect(pegboard().facing).toBe('west');
    expect(edges().east).toBe(floorBounds(ASHERS_ROOM).maxX);
  });

  it('is centred on the desk', () => {
    const desk = deskPart('desk');
    expect((edges().north + edges().south) / 2).toBeCloseTo((desk.north + desk.south) / 2);
  });

  it('has its bottom edge 4½ ft up, above the monitor’s top', () => {
    expect(edges().bottom).toBeCloseTo(4.5);
    expect(edges().bottom).toBeGreaterThan(deskPart('monitor').top);
  });

  it('stays below the Beam and out of the Door swing', () => {
    expect(edges().top).toBeLessThan(clearHeightAtWall(ASHERS_ROOM, 'east'));
    expect(clearOfDoorSwing(ASHERS_ROOM, pegboard())).toBe(true);
  });
});

const decor = (type: 'headphones' | 'shelf') => {
  const found = wallDecorItems(ASHERS_ROOM).find((i) => i.type === type);
  if (!found) throw new Error(`no ${type} in the starter arrangement`);
  const { position, size } = itemBox(found);
  return {
    item: found,
    west: position[0] - size[0] / 2,
    east: position[0] + size[0] / 2,
    north: position[2] - size[2] / 2,
    south: position[2] + size[2] / 2,
    bottom: position[1] - size[1] / 2,
    top: position[1] + size[1] / 2,
  };
};

describe.each(['headphones', 'shelf'] as const)('wallDecorItems: the %s', (type) => {
  it('uses the Catalog size and faces west like the pegboard', () => {
    expect(decor(type).item.size).toEqual(CATALOG[type].size);
    expect(decor(type).item.facing).toBe('west');
  });

  it('stands on the front face of the pegboard, within its outline', () => {
    const board = edges();
    const piece = decor(type);
    expect(piece.east).toBeCloseTo(board.west);
    expect(piece.north).toBeGreaterThanOrEqual(board.north);
    expect(piece.south).toBeLessThanOrEqual(board.south);
    expect(piece.bottom).toBeGreaterThanOrEqual(board.bottom);
    expect(piece.top).toBeLessThanOrEqual(board.top);
  });
});

describe('wallDecorItems: where the pegboard things hang', () => {
  it('puts the headphones in the north third, the shelf in the south third', () => {
    const board = edges();
    const third = (board.south - board.north) / 3;
    expect(decor('headphones').south).toBeLessThanOrEqual(board.north + third);
    expect(decor('shelf').north).toBeGreaterThanOrEqual(board.south - third);
  });

  it('puts the shelf at the mid-height of the pegboard', () => {
    const shelf = decor('shelf');
    expect((shelf.bottom + shelf.top) / 2).toBeCloseTo((edges().bottom + edges().top) / 2);
  });
});
