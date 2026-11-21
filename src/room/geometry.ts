import type { Opening, Room, WallId } from './types';

/** Every Wall, in compass order. */
export const WALLS: readonly WallId[] = ['north', 'east', 'south', 'west'];

/** Interior length of a wall. */
export function wallLength(room: Room, wall: WallId): number {
  return wall === 'north' || wall === 'south' ? room.width : room.depth;
}

/** Height of the underside of the beam on a wall, or the ceiling height if it has none. */
export function clearHeightAtWall(room: Room, wall: WallId): number {
  return room.beams.walls.includes(wall) ? room.ceilingHeight - room.beams.drop : room.ceilingHeight;
}

/** Floor footprint centred on the origin: x runs west→east, z runs north(−)→south(+). */
export function floorBounds(room: Room): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  return {
    minX: -room.width / 2,
    maxX: room.width / 2,
    minZ: -room.depth / 2,
    maxZ: room.depth / 2,
  };
}

function overlaps(a: Opening, b: Opening): boolean {
  return a.offset < b.offset + b.width && b.offset < a.offset + a.width;
}

/**
 * Checks the room's physical invariants. Returns a list of human-readable problems;
 * an empty list means the room is consistent. Run on every measurement change.
 */
export function validateRoom(room: Room): string[] {
  const problems: string[] = [];

  if (room.width <= 0 || room.depth <= 0 || room.ceilingHeight <= 0) {
    problems.push('Room dimensions must be positive.');
  }
  if (room.beams.drop >= room.ceilingHeight) {
    problems.push('Beam drop must be less than the ceiling height.');
  }
  if (room.walls.thickness <= 0) {
    problems.push('Wall thickness must be positive.');
  }
  if (room.skirting.height <= 0 || room.skirting.depth <= 0) {
    problems.push('Skirting depth and height must be positive.');
  }

  const ids = new Set<string>();
  for (const opening of room.openings) {
    if (ids.has(opening.id)) problems.push(`Duplicate opening id "${opening.id}".`);
    ids.add(opening.id);

    const length = wallLength(room, opening.wall);
    if (opening.offset < 0 || opening.offset + opening.width > length) {
      problems.push(`Opening "${opening.id}" does not fit on the ${opening.wall} wall (${length} ft).`);
    }
    const top = opening.sill + opening.height;
    const clear = clearHeightAtWall(room, opening.wall);
    if (top > clear) {
      problems.push(`Opening "${opening.id}" top (${top} ft) is above the clear height (${clear} ft).`);
    }
    if (opening.kind === 'doorway' && opening.sill !== 0) {
      problems.push(`Doorway "${opening.id}" must start at floor level.`);
    }
  }

  for (let i = 0; i < room.openings.length; i++) {
    for (let j = i + 1; j < room.openings.length; j++) {
      const a = room.openings[i];
      const b = room.openings[j];
      if (a && b && a.wall === b.wall && overlaps(a, b)) {
        problems.push(`Openings "${a.id}" and "${b.id}" overlap on the ${a.wall} wall.`);
      }
    }
  }

  for (const door of room.doors) {
    if (door.thickness <= 0) problems.push(`Door "${door.id}" thickness must be positive.`);
    const opening = room.openings.find((o) => o.id === door.openingId);
    if (!opening) problems.push(`Door "${door.id}" refers to missing opening "${door.openingId}".`);
    else if (opening.kind !== 'doorway') {
      problems.push(`Door "${door.id}" must fill a doorway, not a ${opening.kind}.`);
    }
  }

  for (const fitting of room.fittings) {
    const [spanU, spanV] =
      fitting.surface === 'ceiling'
        ? [room.width, room.depth]
        : [wallLength(room, fitting.surface), clearHeightAtWall(room, fitting.surface)];
    const [u, v] = fitting.centre;
    const [w, h] = fitting.size;
    if (u - w / 2 < 0 || u + w / 2 > spanU || v - h / 2 < 0 || v + h / 2 > spanV) {
      problems.push(`Fitting "${fitting.id}" does not fit on the ${fitting.surface}.`);
    }
  }

  return problems;
}
