import { type Fitting, floorBounds, type Room } from '../room';
import { wallFrame } from './wallFrame';

type Vec3 = readonly [number, number, number];

/** A flat plate in scene coordinates (feet): centre, Euler rotation of a +z-facing plane, size. */
export interface Plate {
  readonly position: Vec3;
  readonly rotation: Vec3;
  readonly size: readonly [number, number];
}

/** Lifts a plate just off its surface so it does not z-fight with it. */
const PLATE_LIFT = 0.01;

/** Where a Fitting's plate sits: just off its Wall or the ceiling, facing into the Room. */
export function fittingPlate(room: Room, fitting: Fitting): Plate {
  const [u, v] = fitting.centre;
  if (fitting.surface === 'ceiling') {
    const { minX, minZ } = floorBounds(room);
    return {
      position: [minX + u, room.ceilingHeight - PLATE_LIFT, minZ + v],
      rotation: [Math.PI / 2, 0, 0],
      size: fitting.size,
    };
  }
  const { start, along, outward } = wallFrame(room, fitting.surface);
  // `0 - x`, not `-x`: a -0 would flip atan2 to −π on the south Wall.
  const [inX, inZ] = [0 - outward[0], 0 - outward[1]];
  return {
    position: [start[0] + along[0] * u + inX * PLATE_LIFT, v, start[1] + along[1] * u + inZ * PLATE_LIFT],
    rotation: [0, Math.atan2(inX, inZ), 0],
    size: fitting.size,
  };
}
