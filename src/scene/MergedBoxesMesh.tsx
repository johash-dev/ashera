import { useEffect, useMemo } from 'react';
import { type MeshStandardMaterial } from 'three';
import { type DrawnBox, mergeBoxes } from './mergedBoxes';

/** Boxes drawn as one mesh: parts sharing a material cost one draw call however many there are. */
export function MergedBoxes({
  boxes,
  material,
}: {
  boxes: readonly DrawnBox[];
  material: MeshStandardMaterial;
}) {
  const geometry = useMemo(() => mergeBoxes(boxes), [boxes]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} />;
}
