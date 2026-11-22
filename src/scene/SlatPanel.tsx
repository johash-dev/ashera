import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, type InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { type PanelBox, slatPanelBacking, slatPanelSlats } from '../editor';
import { type Room } from '../room';
import { LOOK } from './look';

/** One instanced mesh of unit boxes, each scaled and placed to a panel piece: one draw call for all of them. */
function PanelPieces({
  pieces,
  geometry,
  material,
}: {
  pieces: readonly PanelBox[];
  geometry: BoxGeometry;
  material: MeshStandardMaterial;
}) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const placer = new Object3D();
    pieces.forEach(({ position, size }, i) => {
      placer.position.set(...position);
      placer.scale.set(...size);
      placer.updateMatrix();
      mesh.current?.setMatrixAt(i, placer.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [pieces]);
  return <instancedMesh ref={mesh} args={[geometry, material, pieces.length]} />;
}

/** The black Slat panel over the TV wall: felt backing strips and the slats in front, open at the cut-outs. */
export function SlatPanel({ room }: { room: Room }) {
  const slats = useMemo(() => slatPanelSlats(room), [room]);
  const backing = useMemo(() => slatPanelBacking(room), [room]);
  const resources = useMemo(
    () => ({
      geometry: new BoxGeometry(1, 1, 1),
      slat: new MeshStandardMaterial({ color: LOOK.slat, roughness: 0.6 }),
      backing: new MeshStandardMaterial({ color: LOOK.slatBacking, roughness: 1 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      resources.geometry.dispose();
      resources.slat.dispose();
      resources.backing.dispose();
    },
    [resources],
  );
  return (
    <group>
      <PanelPieces pieces={backing} geometry={resources.geometry} material={resources.backing} />
      <PanelPieces pieces={slats} geometry={resources.geometry} material={resources.slat} />
    </group>
  );
}
