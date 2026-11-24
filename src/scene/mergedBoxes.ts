import { BoxGeometry, type BufferGeometry, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { type Box } from './roomBoxes';

/** A box, optionally turned about the vertical axis (a positive angle turns its x axis towards -z). */
export type DrawnBox = Box & { readonly yawRad?: number };

const UP = new Vector3(0, 1, 0);
const UNIT = new Vector3(1, 1, 1);

/**
 * One geometry drawn as a single mesh for all the boxes: parts of an Item that share a material cost one
 * draw call however many there are. Boxes are in scene coordinates, so the mesh sits at the origin.
 */
export function mergeBoxes(boxes: readonly DrawnBox[]): BufferGeometry {
  const pieces = boxes.map(({ position, size, yawRad = 0 }) => {
    const geometry = new BoxGeometry(...size);
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
