import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { CATALOG, type Item } from '../editor';
import { standBoxes } from './itemBoxes';
import { LOOK } from './look';
import { type Box } from './roomBoxes';

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

/** The Items of the TV wall, drawn where the editor placed them. */
export function Items({ items }: { items: readonly Item[] }) {
  const materials = useMemo(
    () => ({
      body: new MeshStandardMaterial({ color: LOOK.standBody, roughness: 0.5 }),
      door: new MeshStandardMaterial({ color: LOOK.standDoor, roughness: 0.4 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      materials.body.dispose();
      materials.door.dispose();
    },
    [materials],
  );

  return items.map((item) => {
    const { body, doors } = standBoxes(item, CATALOG[item.type].doors);
    return (
      <group key={item.id}>
        <BoxMesh box={body} material={materials.body} />
        {doors.map((door, i) => (
          <BoxMesh key={i} box={door} material={materials.door} />
        ))}
      </group>
    );
  });
}
