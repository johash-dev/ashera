import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { type Item, TV_LEG_HEIGHT, TV_STAND_DOORS } from '../editor';
import { deskBoxes, ps5Boxes, soundbarBoxes, standBoxes, tvBoxes } from './itemBoxes';
import { LOOK, TV_EDGE_GLOW } from './look';
import { type Box } from './roomBoxes';

type ItemMaterials = Record<
  | 'standBody'
  | 'standDoor'
  | 'tvPanel'
  | 'tvScreen'
  | 'ps5Side'
  | 'ps5Core'
  | 'soundbarBody'
  | 'soundbarGrille'
  | 'deskTop'
  | 'deskLeg',
  MeshStandardMaterial
>;

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
      const { panel, screen, legs } = tvBoxes(item, TV_LEG_HEIGHT);
      return (
        <>
          <BoxMesh box={panel} material={materials.tvPanel} />
          <BoxMesh box={screen} material={materials.tvScreen} />
          {legs.map((leg, i) => (
            <mesh key={i} position={[...leg.position]} rotation-z={leg.angleRad} material={materials.tvPanel}>
              <boxGeometry args={[...leg.size]} />
            </mesh>
          ))}
        </>
      );
    }
    case 'ps5': {
      const { core, sides } = ps5Boxes(item);
      return (
        <>
          <BoxMesh box={core} material={materials.ps5Core} />
          {sides.map((side, i) => (
            <BoxMesh key={i} box={side} material={materials.ps5Side} />
          ))}
        </>
      );
    }
    case 'soundbar': {
      const { body, grille } = soundbarBoxes(item);
      return (
        <>
          <BoxMesh box={body} material={materials.soundbarBody} />
          <BoxMesh box={grille} material={materials.soundbarGrille} />
        </>
      );
    }
    case 'desk': {
      const { top, legs } = deskBoxes(item);
      return (
        <>
          <BoxMesh box={top} material={materials.deskTop} />
          {legs.map((leg, i) => (
            <BoxMesh key={i} box={leg} material={materials.deskLeg} />
          ))}
        </>
      );
    }
  }
}

/** The Items of the starter arrangement, drawn where the editor placed them. */
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
      ps5Side: new MeshStandardMaterial({ color: LOOK.ps5Side, roughness: 0.35 }),
      ps5Core: new MeshStandardMaterial({ color: LOOK.ps5Core, roughness: 0.4 }),
      soundbarBody: new MeshStandardMaterial({ color: LOOK.soundbarBody, roughness: 0.5 }),
      soundbarGrille: new MeshStandardMaterial({ color: LOOK.soundbarGrille, roughness: 0.8 }),
      deskTop: new MeshStandardMaterial({ color: LOOK.deskTop, roughness: 0.6 }),
      deskLeg: new MeshStandardMaterial({ color: LOOK.deskLeg, roughness: 0.5 }),
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
