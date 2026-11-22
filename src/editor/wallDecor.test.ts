import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM, clearHeightAtWall, floorBounds } from '../room';
import { CATALOG } from './catalog';
import { deskItems } from './desk';
import { clearOfDoorSwing, itemBox } from './items';
import { SOFA_CHOICES, sofaItems } from './sofa';
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

const frames = () => wallDecorItems(ASHERS_ROOM).filter((i) => i.type === 'frame');

describe.each(SOFA_CHOICES)('wallDecorItems: the picture frames above the %s sofa', (sofa) => {
  const sofaLong = () => {
    const found = sofaItems(ASHERS_ROOM, sofa).find((i) => i.id === 'sofa');
    if (!found) throw new Error('no sofa');
    return itemBox(found);
  };
  const boxes = () => frames().map(itemBox);

  it('has three frames of the Catalog size, facing north', () => {
    expect(frames()).toHaveLength(3);
    for (const frame of frames()) {
      expect(frame.size).toEqual(CATALOG.frame.size);
      expect(frame.facing).toBe('north');
    }
  });

  it('hangs them on the south wall face, bottom 4 ft up, above the sofa', () => {
    const { maxZ } = floorBounds(ASHERS_ROOM);
    for (const { position, size } of boxes()) {
      expect(position[2] + size[2] / 2).toBeCloseTo(maxZ);
      expect(position[1] - size[1] / 2).toBeCloseTo(4);
    }
    const sofaTop = sofaLong().position[1] + sofaLong().size[1] / 2;
    expect(4).toBeGreaterThan(sofaTop);
  });

  it('spaces them 6 in apart in a row centred on the sofa', () => {
    const [a, b, c] = boxes().sort((p, q) => p.position[0] - q.position[0]);
    if (!a || !b || !c) throw new Error('expected three frames');
    expect(b.position[0]).toBeCloseTo(sofaLong().position[0]);
    expect(b.position[0] - a.position[0]).toBeCloseTo(c.position[0] - b.position[0]);
    expect(b.position[0] - a.position[0] - a.size[0]).toBeCloseTo(0.5);
  });

  it('stays below the Beam and clear of every south wall Fitting', () => {
    const { maxX } = floorBounds(ASHERS_ROOM);
    const row = boxes();
    for (const { position, size } of row)
      expect(position[1] + size[1] / 2).toBeLessThan(clearHeightAtWall(ASHERS_ROOM, 'south'));
    for (const fitting of ASHERS_ROOM.fittings.filter((f) => f.surface === 'south')) {
      const plateX = maxX - fitting.centre[0]; // measured from the south-east corner
      for (const { position, size } of row)
        expect(Math.abs(position[0] - plateX)).toBeGreaterThan((size[0] + fitting.size[0]) / 2);
    }
  });
});
