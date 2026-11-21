import { type Door, type Room, skirtingRuns, type WallId, wallLength, wallPieces } from '../room';
import { type WallFrame, wallFrame } from './wallFrame';

type Vec3 = readonly [number, number, number];

/** An axis-aligned box in scene coordinates (feet): centre and full size. */
export interface Box {
  readonly position: Vec3;
  readonly size: Vec3;
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

/** World boxes for a Wall's Skirting, standing against its interior face and broken at doorways. */
export function skirtingBoxes(room: Room, wall: WallId): Box[] {
  const frame = wallFrame(room, wall);
  const { height, depth } = room.skirting;
  return skirtingRuns(room, wall).map(({ u0, u1 }) =>
    boxOnWall(frame, (u0 + u1) / 2, -depth / 2, height / 2, u1 - u0, height, depth),
  );
}

/**
 * World box for a Door leaf fixed open 90°: it stands out from the hinge into the Room, flat
 * against the neighbouring Wall, with its thickness running back across the doorway.
 */
export function doorLeafBox(room: Room, door: Door): Box {
  const opening = room.openings.find((o) => o.id === door.openingId);
  if (!opening) throw new Error(`Door "${door.id}" refers to missing opening "${door.openingId}".`);
  const hingeU = door.hinge === 'start' ? opening.offset : opening.offset + opening.width;
  const towardFreeEnd = door.hinge === 'start' ? 1 : -1;
  return boxOnWall(
    wallFrame(room, opening.wall),
    hingeU + (towardFreeEnd * door.thickness) / 2,
    -opening.width / 2,
    opening.height / 2,
    door.thickness,
    opening.height,
    opening.width,
  );
}
