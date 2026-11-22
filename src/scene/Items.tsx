import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { type Item, TV_FEET_HEIGHT, TV_STAND_DOORS } from '../editor';
import { standBoxes, tvBoxes } from './itemBoxes';
import { LOOK, TV_EDGE_GLOW } from './look';
import { type Box } from './roomBoxes';

type ItemMaterials = Record<'standBody' | 'standDoor' | 'tvPanel' | 'tvScreen', MeshStandardMaterial>;

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

function ItemMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  switch (item.type) {
    case 'tv-stand': {
      const { body, doors } = standBoxes(item, TV_STAND_DOORS);
      return (
        <>
          <BoxMesh box={body} material={materials.standBody} />
          {doors.map((door, i) => (
            <BoxMesh key={i} box={door} material={materials.standDoor} />
          ))}
        </>
      );
    }
    case 'tv-55':
    case 'tv-65': {
      const { panel, screen, feet } = tvBoxes(item, TV_FEET_HEIGHT);
      return (
        <>
          <BoxMesh box={panel} material={materials.tvPanel} />
          <BoxMesh box={screen} material={materials.tvScreen} />
          {feet.map((foot, i) => (
            <BoxMesh key={i} box={foot} material={materials.tvPanel} />
          ))}
        </>
      );
    }
  }
}

/** The Items of the TV wall, drawn where the editor placed them. */
export function Items({ items }: { items: readonly Item[] }) {
  const materials = useMemo<ItemMaterials>(
    () => ({
      standBody: new MeshStandardMaterial({ color: LOOK.standBody, roughness: 0.5 }),
      standDoor: new MeshStandardMaterial({ color: LOOK.standDoor, roughness: 0.4 }),
      tvPanel: new MeshStandardMaterial({
        color: LOOK.tvEdge,
        emissive: LOOK.tvEdge,
        emissiveIntensity: TV_EDGE_GLOW,
        roughness: 0.4,
      }),
      tvScreen: new MeshStandardMaterial({ color: LOOK.tvScreen, roughness: 0.15 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);

  return items.map((item) => (
    <group key={item.id}>
      <ItemMeshes item={item} materials={materials} />
    </group>
  ));
}
