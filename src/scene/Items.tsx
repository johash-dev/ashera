import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { itemBox, type Item, TV_LEG_HEIGHT, TV_STAND_DOORS } from '../editor';
import {
  chairBoxes,
  deskBoxes,
  frameBoxes,
  headphonesBoxes,
  keyboardBoxes,
  monitorBoxes,
  mouseBoxes,
  ps5Boxes,
  sofaArmSides,
  sofaBoxes,
  soundbarBoxes,
  standBoxes,
  towerBoxes,
  tvBoxes,
} from './itemBoxes';
import { ACCENT_GLOW, LOOK, TV_EDGE_GLOW } from './look';
import { type DrawnBox, mergeBoxes } from './mergedBoxes';
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
  | 'deviceGlass'
  | 'accentGlow'
  | 'chairBody'
  | 'chairTrim'
  | 'chairStripe'
  | 'sofaFrame'
  | 'sofaCushion'
  | 'rug'
  | 'pegboard'
  | 'frame'
  | 'frameArt'
  | 'frameLine',
  MeshStandardMaterial
>;

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

/** Boxes drawn as one mesh: parts of an Item sharing a material cost one draw call however many there are. */
function MergedBoxes({ boxes, material }: { boxes: readonly DrawnBox[]; material: MeshStandardMaterial }) {
  const geometry = useMemo(() => mergeBoxes(boxes), [boxes]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} />;
}

function StandMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { body, top, doors, handles } = useMemo(() => standBoxes(item, TV_STAND_DOORS), [item]);
  const carcass = useMemo(() => [body], [body]);
  const lighter = useMemo(() => [top, ...doors], [top, doors]);
  return (
    <>
      <MergedBoxes boxes={carcass} material={materials.standBody} />
      <MergedBoxes boxes={lighter} material={materials.standDoor} />
      <MergedBoxes boxes={handles} material={materials.deviceTrim} />
    </>
  );
}

function TvMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { panel, housing, screen, led, legs } = useMemo(() => tvBoxes(item, TV_LEG_HEIGHT), [item]);
  const panelBoxes = useMemo(() => [panel], [panel]);
  const housingBoxes = useMemo(() => [housing], [housing]);
  const screenBoxes = useMemo(() => [screen], [screen]);
  const ledBoxes = useMemo(() => [led], [led]);
  return (
    <>
      <MergedBoxes boxes={panelBoxes} material={materials.tvPanel} />
      <MergedBoxes boxes={housingBoxes} material={materials.deviceBody} />
      <MergedBoxes boxes={screenBoxes} material={materials.tvScreen} />
      <MergedBoxes boxes={ledBoxes} material={materials.accentGlow} />
      {legs.map((leg, i) => (
        <mesh key={i} position={[...leg.position]} rotation-z={leg.angleRad} material={materials.tvPanel}>
          <boxGeometry args={[...leg.size]} />
        </mesh>
      ))}
    </>
  );
}

function Ps5Meshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { core, sides, base, strip } = useMemo(() => ps5Boxes(item), [item]);
  const dark = useMemo(() => [core, base], [core, base]);
  const stripBoxes = useMemo(() => [strip], [strip]);
  return (
    <>
      <MergedBoxes boxes={dark} material={materials.ps5Core} />
      <MergedBoxes boxes={sides} material={materials.ps5Side} />
      <MergedBoxes boxes={stripBoxes} material={materials.accentGlow} />
    </>
  );
}

function SoundbarMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { body, grille, led } = useMemo(() => soundbarBoxes(item), [item]);
  const bodyBoxes = useMemo(() => [body], [body]);
  const grilleBoxes = useMemo(() => [grille], [grille]);
  const ledBoxes = useMemo(() => [led], [led]);
  return (
    <>
      <MergedBoxes boxes={bodyBoxes} material={materials.soundbarBody} />
      <MergedBoxes boxes={grilleBoxes} material={materials.soundbarGrille} />
      <MergedBoxes boxes={ledBoxes} material={materials.accentGlow} />
    </>
  );
}

function DeskMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { top, legs, rails } = useMemo(() => deskBoxes(item), [item]);
  const frame = useMemo(() => [...legs, ...rails], [legs, rails]);
  const topBoxes = useMemo(() => [top], [top]);
  return (
    <>
      <MergedBoxes boxes={topBoxes} material={materials.deskTop} />
      <MergedBoxes boxes={frame} material={materials.deskLeg} />
    </>
  );
}

function MonitorMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { foot, neck, panel, back, screen, led } = useMemo(() => monitorBoxes(item), [item]);
  const body = useMemo(() => [foot, neck, panel, back], [foot, neck, panel, back]);
  const screenBoxes = useMemo(() => [screen], [screen]);
  const ledBoxes = useMemo(() => [led], [led]);
  return (
    <>
      <MergedBoxes boxes={body} material={materials.deviceBody} />
      <MergedBoxes boxes={screenBoxes} material={materials.tvScreen} />
      <MergedBoxes boxes={ledBoxes} material={materials.accentGlow} />
    </>
  );
}

function TowerMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { body, front, vents, strip, glass, feet } = useMemo(() => towerBoxes(item), [item]);
  const dark = useMemo(() => [body, ...vents, ...feet], [body, vents, feet]);
  const frontBoxes = useMemo(() => [front], [front]);
  const glassBoxes = useMemo(() => [glass], [glass]);
  const stripBoxes = useMemo(() => [strip], [strip]);
  return (
    <>
      <MergedBoxes boxes={dark} material={materials.deviceBody} />
      <MergedBoxes boxes={frontBoxes} material={materials.deviceTrim} />
      <MergedBoxes boxes={glassBoxes} material={materials.deviceGlass} />
      <MergedBoxes boxes={stripBoxes} material={materials.accentGlow} />
    </>
  );
}

function KeyboardMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { body, rows } = useMemo(() => keyboardBoxes(item), [item]);
  const bodyBoxes = useMemo(() => [body], [body]);
  return (
    <>
      <MergedBoxes boxes={bodyBoxes} material={materials.deviceBody} />
      <MergedBoxes boxes={rows} material={materials.deviceTrim} />
    </>
  );
}

function MouseMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const { shell, hump, buttons, wheel } = useMemo(() => mouseBoxes(item), [item]);
  const shape = useMemo(() => [shell, hump, ...buttons], [shell, hump, buttons]);
  const wheelBoxes = useMemo(() => [wheel], [wheel]);
  return (
    <>
      <MergedBoxes boxes={shape} material={materials.deviceTrim} />
      <MergedBoxes boxes={wheelBoxes} material={materials.accentGlow} />
    </>
  );
}

function ChairMeshes({ item, materials }: { item: Item; materials: ItemMaterials }) {
  const parts = useMemo(() => chairBoxes(item), [item]);
  const body = useMemo(
    () => [...parts.base, ...parts.casters, parts.column, ...parts.arms.filter((_, i) => i % 2 === 0)],
    [parts],
  );
  const trim = useMemo(
    () => [
      parts.seat,
      ...parts.bolsters,
      parts.back,
      parts.headrest,
      ...parts.wings,
      ...parts.arms.filter((_, i) => i % 2 === 1),
    ],
    [parts],
  );
  return (
    <>
      <MergedBoxes boxes={body} material={materials.chairBody} />
      <MergedBoxes boxes={trim} material={materials.chairTrim} />
      <MergedBoxes boxes={parts.stripes} material={materials.chairStripe} />
    </>
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
    case 'tv-stand':
      return <StandMeshes item={item} materials={materials} />;
    case 'tv-55':
    case 'tv-65':
      return <TvMeshes item={item} materials={materials} />;
    case 'ps5':
      return <Ps5Meshes item={item} materials={materials} />;
    case 'soundbar':
      return <SoundbarMeshes item={item} materials={materials} />;
    case 'desk':
      return <DeskMeshes item={item} materials={materials} />;
    case 'monitor':
      return <MonitorMeshes item={item} materials={materials} />;
    case 'pc-tower':
      return <TowerMeshes item={item} materials={materials} />;
    case 'keyboard':
      return <KeyboardMeshes item={item} materials={materials} />;
    case 'mouse':
      return <MouseMeshes item={item} materials={materials} />;
    case 'sofa-compact':
    case 'sofa-l-long':
    case 'sofa-l-short':
      return <SofaMeshes item={item} materials={materials} />;
    case 'rug':
      return <BoxMesh box={itemBox(item)} material={materials.rug} />;
    case 'pegboard':
      return <BoxMesh box={itemBox(item)} material={materials.pegboard} />;
    case 'frame': {
      const { body, art, line } = frameBoxes(item);
      return (
        <>
          <BoxMesh box={body} material={materials.frame} />
          <BoxMesh box={art} material={materials.frameArt} />
          <BoxMesh box={line} material={materials.frameLine} />
        </>
      );
    }
    case 'shelf':
      return <BoxMesh box={itemBox(item)} material={materials.deviceTrim} />;
    case 'headphones': {
      const { band, cups, hook } = headphonesBoxes(item);
      return (
        <>
          {[band, ...cups].map((box, i) => (
            <BoxMesh key={i} box={box} material={materials.deviceBody} />
          ))}
          <BoxMesh box={hook} material={materials.deviceTrim} />
        </>
      );
    }
    case 'gaming-chair':
      return <ChairMeshes item={item} materials={materials} />;
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
      deviceGlass: new MeshStandardMaterial({ color: LOOK.deviceGlass, roughness: 0.1 }),
      accentGlow: new MeshStandardMaterial({
        color: LOOK.accent,
        emissive: LOOK.accent,
        emissiveIntensity: ACCENT_GLOW,
        roughness: 0.5,
      }),
      chairBody: new MeshStandardMaterial({ color: LOOK.chairBody, roughness: 0.6 }),
      chairStripe: new MeshStandardMaterial({ color: LOOK.chairStripe, roughness: 0.7 }),
      sofaFrame: new MeshStandardMaterial({ color: LOOK.sofaFrame, roughness: 0.9 }),
      sofaCushion: new MeshStandardMaterial({ color: LOOK.sofaCushion, roughness: 0.9 }),
      rug: new MeshStandardMaterial({ color: LOOK.rug, roughness: 1 }),
      frame: new MeshStandardMaterial({ color: LOOK.frame, roughness: 0.6 }),
      frameArt: new MeshStandardMaterial({ color: LOOK.frameArt, roughness: 0.8 }),
      frameLine: new MeshStandardMaterial({ color: LOOK.frameLine, roughness: 0.8 }),
      pegboard: new MeshStandardMaterial({ color: LOOK.pegboard, roughness: 0.8 }),
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
