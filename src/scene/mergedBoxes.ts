import { BoxGeometry, type BufferGeometry, Matrix4, Quaternion, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { type Box } from './roomBoxes';

/**
 * A box, optionally turned about the vertical axis (a positive angle turns its x axis towards -z), with its
 * edges rounded by `radius` feet (0 = sharp). Without a radius the edges get the default soft round.
 */
export type DrawnBox = Box & { readonly yawRad?: number; readonly radius?: number };

/** The default edge round, about half an inch: enough to catch a highlight without changing a silhouette. */
const EDGE_RADIUS = 0.04;
/** A round never takes more than this share of a box's thinnest side, so slim boxes (Walls, slats) stay flat. */
const MAX_ROUND_SHARE = 0.25;
/** Curve segments per rounded corner: two is smooth enough at this scale and keeps the triangle count low. */
const ROUND_SEGMENTS = 2;

function boxGeometry([width, height, depth]: Box['size'], radius: number): BufferGeometry {
  const round = Math.min(radius, Math.min(width, height, depth) * MAX_ROUND_SHARE);
  return round > 0
    ? new RoundedBoxGeometry(width, height, depth, ROUND_SEGMENTS, round)
    : new BoxGeometry(width, height, depth);
}

const UP = new Vector3(0, 1, 0);
const UNIT = new Vector3(1, 1, 1);

/**
 * One geometry drawn as a single mesh for all the boxes: parts of an Item that share a material cost one
 * draw call however many there are. Boxes are in scene coordinates, so the mesh sits at the origin.
 */
export function mergeBoxes(boxes: readonly DrawnBox[]): BufferGeometry {
  const pieces = boxes.map(({ position, size, yawRad = 0, radius = EDGE_RADIUS }) => {
    const geometry = boxGeometry(size, radius);
    geometry.applyMatrix4(
      new Matrix4().compose(new Vector3(...position), new Quaternion().setFromAxisAngle(UP, yawRad), UNIT),
    );
    return geometry;
  });
  const merged = mergeGeometries(pieces);
  pieces.forEach((piece) => piece.dispose());
  if (!merged) throw new Error('mergeBoxes: needs at least one box');
  return merged;
}
