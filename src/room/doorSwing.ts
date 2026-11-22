import type { Door, Room } from './types';
import { wallFrame } from './wallFrame';

type Vec2 = readonly [number, number];

/**
 * The one pose the scene draws, reported as `__ASHERA__.door.openAngleDeg`. Not configurable: the leaf
 * (`doorLeafBox`) and the swing's quarter circle are both built for exactly 90°.
 */
export const DOOR_OPEN_ANGLE_DEG = 90;

/** Segments in the drawn arc; enough to look round at Room scale. */
const ARC_SEGMENTS = 16;

/** The floor area a Door sweeps as it opens, in scene coordinates (feet): x east, z south. */
export interface DoorSwing {
  readonly hinge: Vec2;
  /** The leaf length, equal to the doorway width. */
  readonly radius: number;
  /** The leaf's free end when closed (across the doorway) and when open 90° (into the Room). */
  readonly closedEnd: Vec2;
  readonly openEnd: Vec2;
  /** Points of the quarter circle from `closedEnd` to `openEnd`. */
  readonly arc: readonly Vec2[];
}

/** Where a Door's leaf swings: hinge, radius and the quarter-circle it sweeps, into the Room. */
export function doorSwing(room: Room, door: Door): DoorSwing {
  const opening = room.openings.find((o) => o.id === door.openingId);
  if (!opening) throw new Error(`Door "${door.id}" refers to missing opening "${door.openingId}".`);

  const { start, along, outward } = wallFrame(room, opening.wall);
  const at = (u: number): Vec2 => [start[0] + along[0] * u, start[1] + along[1] * u];
  const hingeU = door.hinge === 'start' ? opening.offset : opening.offset + opening.width;
  const freeU = door.hinge === 'start' ? opening.offset + opening.width : opening.offset;

  const radius = opening.width;
  const hinge = at(hingeU);
  const closedEnd = at(freeU);
  const openEnd: Vec2 = [hinge[0] - outward[0] * radius, hinge[1] - outward[1] * radius];

  // The leaf turns a quarter circle from the doorway into the Room; the cross product gives the direction.
  const closedAngle = Math.atan2(closedEnd[1] - hinge[1], closedEnd[0] - hinge[0]);
  const cross =
    (closedEnd[0] - hinge[0]) * (openEnd[1] - hinge[1]) - (closedEnd[1] - hinge[1]) * (openEnd[0] - hinge[0]);
  const sweepRad = Math.sign(cross) * (Math.PI / 2);
  const arc = Array.from({ length: ARC_SEGMENTS + 1 }, (_, i): Vec2 => {
    const angle = closedAngle + (sweepRad * i) / ARC_SEGMENTS;
    return [hinge[0] + radius * Math.cos(angle), hinge[1] + radius * Math.sin(angle)];
  });

  return { hinge, radius, closedEnd, openEnd, arc };
}
