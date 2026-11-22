import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { itemBox, type Item, TV_LEG_HEIGHT, TV_STAND_DOORS } from '../editor';
import {
  chairBoxes,
  deskBoxes,
  keyboardBoxes,
  monitorBoxes,
  ps5Boxes,
  sofaArmSides,
  sofaBoxes,
  soundbarBoxes,
  standBoxes,
  towerBoxes,
  tvBoxes,
} from './itemBoxes';
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
  | 'deskLeg'
  | 'deviceBody'
  | 'deviceTrim'
  | 'chairBody'
  | 'chairTrim'
  | 'sofaFrame'
  | 'sofaCushion'
  | 'rug',
  MeshStandardMaterial
>;

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

function SofaMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { base, back, arms, cushions } = sofaBoxes(item, sofaArmSides(item.type));
  return (
    <>
      <BoxMesh box={base} material={materials.sofaFrame} />
      <BoxMesh box={back} material={materials.sofaFrame} />
      {arms.map((box, i) => (
        <BoxMesh key={i} box={box} material={materials.sofaFrame} />
      ))}
      {cushions.map((box, i) => (
        <BoxMesh key={i} box={box} material={materials.sofaCushion} />
      ))}
    </>
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
    case 'monitor': {
      const { foot, neck, panel, screen } = monitorBoxes(item);
      return (
        <>
          <BoxMesh box={foot} material={materials.deviceBody} />
          <BoxMesh box={neck} material={materials.deviceBody} />
          <BoxMesh box={panel} material={materials.deviceBody} />
          <BoxMesh box={screen} material={materials.tvScreen} />
        </>
      );
    }
    case 'pc-tower': {
      const { body, front } = towerBoxes(item);
      return (
        <>
          <BoxMesh box={body} material={materials.deviceBody} />
          <BoxMesh box={front} material={materials.deviceTrim} />
        </>
      );
    }
    case 'keyboard': {
      const { body, keys } = keyboardBoxes(item);
      return (
        <>
          <BoxMesh box={body} material={materials.deviceBody} />
          <BoxMesh box={keys} material={materials.deviceTrim} />
        </>
      );
    }
    case 'mouse':
      return <BoxMesh box={itemBox(item)} material={materials.deviceTrim} />;
    case 'sofa-compact':
    case 'sofa-l-long':
    case 'sofa-l-short':
      return <SofaMeshes item={item} materials={materials} />;
    case 'rug':
      return <BoxMesh box={itemBox(item)} material={materials.rug} />;
    case 'gaming-chair': {
      const { base, column, seat, back, arms } = chairBoxes(item);
      return (
        <>
          {[...base, column].map((box, i) => (
            <BoxMesh key={i} box={box} material={materials.chairBody} />
          ))}
          <BoxMesh box={seat} material={materials.chairTrim} />
          <BoxMesh box={back} material={materials.chairTrim} />
          {arms.map((box, i) => (
            <BoxMesh key={i} box={box} material={materials.chairBody} />
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
      deviceBody: new MeshStandardMaterial({ color: LOOK.deviceBody, roughness: 0.5 }),
      deviceTrim: new MeshStandardMaterial({ color: LOOK.deviceTrim, roughness: 0.6 }),
      chairBody: new MeshStandardMaterial({ color: LOOK.chairBody, roughness: 0.6 }),
      sofaFrame: new MeshStandardMaterial({ color: LOOK.sofaFrame, roughness: 0.9 }),
      sofaCushion: new MeshStandardMaterial({ color: LOOK.sofaCushion, roughness: 0.9 }),
      rug: new MeshStandardMaterial({ color: LOOK.rug, roughness: 1 }),
      chairTrim: new MeshStandardMaterial({ color: LOOK.chairTrim, roughness: 0.8 }),
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
