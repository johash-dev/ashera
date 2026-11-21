import { floorBounds, type Room, type WallId, wallLength, wallPieces } from '../room';

type Vec3 = readonly [number, number, number];

/** An axis-aligned box in scene coordinates (feet): centre and full size. */
export interface Box {
  readonly position: Vec3;
  readonly size: Vec3;
}

/** A Wall's start corner, the direction it runs (clockwise from above) and its outward normal. */
interface WallFrame {
  readonly start: readonly [number, number];
  readonly along: readonly [number, number];
  readonly outward: readonly [number, number];
}

function wallFrame(room: Room, wall: WallId): WallFrame {
  const { minX, maxX, minZ, maxZ } = floorBounds(room);
  switch (wall) {
    case 'north':
      return { start: [minX, minZ], along: [1, 0], outward: [0, -1] };
    case 'east':
      return { start: [maxX, minZ], along: [0, 1], outward: [1, 0] };
    case 'south':
      return { start: [maxX, maxZ], along: [-1, 0], outward: [0, 1] };
    case 'west':
      return { start: [minX, maxZ], along: [0, -1], outward: [-1, 0] };
  }
}

/** Box centred `u` along the wall and `w` outward from its interior face, sized `length` × `height` × `depth`. */
function boxOnWall(
  frame: WallFrame,
  u: number,
  w: number,
  y: number,
  length: number,
  height: number,
  depth: number,
): Box {
  const [sx, sz] = frame.start;
  const [ax, az] = frame.along;
  const [ox, oz] = frame.outward;
  const runsAlongX = ax !== 0;
  return {
    position: [sx + ax * u + ox * w, y, sz + az * u + oz * w],
    size: runsAlongX ? [length, height, depth] : [depth, height, length],
  };
}

/**
 * World boxes for a Wall's pieces. Walls grow outward by their thickness; pieces that touch a
 * corner extend by the thickness so the outside corner is closed even when a neighbour is hidden.
 */
export function wallBoxes(room: Room, wall: WallId): Box[] {
  const frame = wallFrame(room, wall);
  const length = wallLength(room, wall);
  const t = room.walls.thickness;
  return wallPieces(room, wall).map(({ u0, u1, v0, v1 }) => {
    const start = u0 === 0 ? -t : u0;
    const end = u1 === length ? length + t : u1;
    return boxOnWall(frame, (start + end) / 2, t / 2, (v0 + v1) / 2, end - start, v1 - v0, t);
  });
}

/** World box for the Beam along the top of a Wall, projecting into the Room. */
export function beamBox(room: Room, wall: WallId): Box {
  const { drop, depth } = room.beams;
  const length = wallLength(room, wall);
  return boxOnWall(
    wallFrame(room, wall),
    length / 2,
    -depth / 2,
    room.ceilingHeight - drop / 2,
    length,
    drop,
    depth,
  );
}
