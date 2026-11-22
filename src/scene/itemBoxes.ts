import { type Facing, type Item, itemBox } from '../editor';
import { type Box } from './roomBoxes';

/** Gap around and between the stand's doors, so they read as separate doors. */
const DOOR_GAP = 0.03;
/** How far each door stands proud of the stand's front face. */
const DOOR_THICKNESS = 0.02;

/** A stand's body, and its doors as thin panels side by side on its front (south) face. */
export function standBoxes(item: Item, doorCount: number): { body: Box; doors: Box[] } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  const doorWidth = (width - DOOR_GAP * (doorCount + 1)) / doorCount;
  const doorZ = z + depth / 2 + DOOR_THICKNESS / 2;
  const doors = Array.from({ length: doorCount }, (_, i): Box => ({
    position: [x - width / 2 + DOOR_GAP + doorWidth / 2 + i * (doorWidth + DOOR_GAP), y, doorZ],
    size: [doorWidth, height - 2 * DOOR_GAP, DOOR_THICKNESS],
  }));
  return { body: { position: item.position, size: item.size }, doors };
}

/** Width of the panel edge left showing around the screen. */
const TV_EDGE = 0.04;
/** How far the screen stands proud of the panel front. */
const SCREEN_THICKNESS = 0.01;
/** Each leg's thickness, its slant from upright, and where its top sits in from the panel's ends (share of the width). */
const TV_LEG_THICKNESS = 0.04;
const TV_LEG_SLANT_RAD = (35 * Math.PI) / 180;
const TV_LEG_INSET = 1 / 6;

/** A box tilted about the z axis (from the front): a positive angle tilts its top towards -x. */
export interface TiltedBox extends Box {
  readonly angleRad: number;
}

/** A TV on its legs: the panel, the screen on its front (south) face, and two legs slanting outward below. */
export function tvBoxes(item: Item, legHeight: number): { panel: Box; screen: Box; legs: TiltedBox[] } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  const floor = y - height / 2;
  const panelHeight = height - legHeight;
  const panelY = floor + legHeight + panelHeight / 2;
  const legLength = legHeight / Math.cos(TV_LEG_SLANT_RAD);
  // Each leg's top is set in from the panel end; its centre is half the slant further out.
  const legOffset = width / 2 - width * TV_LEG_INSET + (legHeight / 2) * Math.tan(TV_LEG_SLANT_RAD);
  return {
    panel: { position: [x, panelY, z], size: [width, panelHeight, depth] },
    screen: {
      position: [x, panelY, z + depth / 2 + SCREEN_THICKNESS / 2],
      size: [width - 2 * TV_EDGE, panelHeight - 2 * TV_EDGE, SCREEN_THICKNESS],
    },
    legs: [-1, 1].map((side): TiltedBox => ({
      position: [x + side * legOffset, floor + legHeight / 2, z],
      size: [TV_LEG_THICKNESS, legLength, depth],
      // The left leg's top leans right (towards the centre), the right leg's leans left.
      angleRad: side * TV_LEG_SLANT_RAD,
    })),
  };
}

/** Share of the PS5's width taken by each white side panel. */
const PS5_SIDE_SHARE = 0.3;

/** An upright PS5: a black core between white side panels on its east and west faces. */
export function ps5Boxes(item: Item): { core: Box; sides: Box[] } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  const side = width * PS5_SIDE_SHARE;
  return {
    core: { position: [x, y, z], size: [width - 2 * side, height, depth] },
    sides: [-1, 1].map((dir): Box => ({
      position: [x + (dir * (width - side)) / 2, y, z],
      size: [side, height, depth],
    })),
  };
}

/** Width of the soundbar body left showing around its grille. */
const SOUNDBAR_EDGE = 0.03;
/** How far the grille stands proud of the soundbar front. */
const GRILLE_THICKNESS = 0.01;

/** A soundbar: its body and the grille on its front (south) face. */
export function soundbarBoxes(item: Item): { body: Box; grille: Box } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  return {
    body: { position: item.position, size: item.size },
    grille: {
      position: [x, y, z + depth / 2 + GRILLE_THICKNESS / 2],
      size: [width - 2 * SOUNDBAR_EDGE, height - 2 * SOUNDBAR_EDGE, GRILLE_THICKNESS],
    },
  };
}

/** Thickness of the desk top, and of each square leg. */
const DESK_TOP_THICKNESS = 0.1;
const DESK_LEG = 0.15;

/** A desk: its top over the whole footprint and four square legs under its corners. */
export function deskBoxes(item: Item): { top: Box; legs: Box[] } {
  const { position, size } = itemBox(item);
  const [x, y, z] = position;
  const [width, height, depth] = size;
  const floor = y - height / 2;
  const legHeight = height - DESK_TOP_THICKNESS;
  const legX = width / 2 - DESK_LEG / 2;
  const legZ = depth / 2 - DESK_LEG / 2;
  return {
    top: {
      position: [x, floor + legHeight + DESK_TOP_THICKNESS / 2, z],
      size: [width, DESK_TOP_THICKNESS, depth],
    },
    legs: [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz): Box => ({
        position: [x + sx * legX, floor + legHeight / 2, z + sz * legZ],
        size: [DESK_LEG, legHeight, DESK_LEG],
      })),
    ),
  };
}

type Vec3 = Box['size'];

const inches = (n: number) => n / 12;

/** Unit vector (west–east, north–south) of the way an Item's front points. */
const FRONT: Record<Facing, readonly [number, number]> = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
};

/**
 * A part of an Item, in the Item's own frame: `lateral` to its right, `bottom` above the Item's floor
 * (feet) and `forward` towards its front, from the Item's centre. Sized width × height × depth in that frame.
 */
function part(item: Item, lateral: number, bottom: number, forward: number, size: Vec3): Box {
  const [fx, fz] = FRONT[item.facing];
  const [rx, rz] = [-fz, fx];
  const [x, y, z] = item.position;
  const [width, height, depth] = size;
  const turned = fx !== 0;
  return {
    position: [
      x + rx * lateral + fx * forward,
      y - item.size[1] / 2 + bottom + height / 2,
      z + rz * lateral + fz * forward,
    ],
    size: turned ? [depth, height, width] : size,
  };
}

/** A monitor: a flat foot, a neck, the panel near the back, and the screen on the panel's front. */
export function monitorBoxes(item: Item): { foot: Box; neck: Box; panel: Box; screen: Box } {
  const [width, height, depth] = item.size;
  const footHeight = inches(0.6);
  const panelHeight = inches(14.2);
  const panelDepth = inches(1);
  const bezel = inches(0.4);
  const panelBottom = height - panelHeight;
  const panelForward = -depth / 2 + inches(2);
  return {
    foot: part(item, 0, 0, 0, [inches(10), footHeight, depth]),
    neck: part(item, 0, footHeight, panelForward, [inches(2), panelBottom - footHeight, inches(1)]),
    panel: part(item, 0, panelBottom, panelForward, [width, panelHeight, panelDepth]),
    screen: part(item, 0, panelBottom + bezel, panelForward + panelDepth / 2 + inches(0.05), [
      width - 2 * bezel,
      panelHeight - 2 * bezel,
      inches(0.1),
    ]),
  };
}

/** A PC tower: its body and a slightly lighter front panel. */
export function towerBoxes(item: Item): { body: Box; front: Box } {
  const [width, height, depth] = item.size;
  const frontDepth = inches(0.4);
  return {
    body: part(item, 0, 0, 0, item.size),
    front: part(item, 0, inches(1), depth / 2 + frontDepth / 2, [
      width - inches(1),
      height - inches(2),
      frontDepth,
    ]),
  };
}

/** A keyboard: its body and a slightly lighter key block on top. */
export function keyboardBoxes(item: Item): { body: Box; keys: Box } {
  const [width, height, depth] = item.size;
  const rim = inches(0.4);
  const keysHeight = inches(0.2);
  return {
    body: part(item, 0, 0, 0, item.size),
    keys: part(item, 0, height, 0, [width - 2 * rim, keysHeight, depth - 2 * rim]),
  };
}

/** A gaming chair: a two-bar base, a column, the seat, a tall backrest and two armrests. */
export function chairBoxes(item: Item): { base: Box[]; column: Box; seat: Box; back: Box; arms: Box[] } {
  const [width, height, depth] = item.size;
  const baseSpan = Math.min(width, depth) - inches(1);
  const baseThickness = inches(1.5);
  const seatBottom = inches(17);
  const seatThickness = inches(4);
  const seatWidth = inches(20);
  const seatDepth = inches(21);
  const seatTop = seatBottom + seatThickness;
  const backDepth = inches(4);
  const armHeight = inches(7);
  const armLateral = inches(11.5);
  return {
    base: [
      part(item, 0, 0, 0, [baseSpan, baseThickness, baseThickness]),
      part(item, 0, 0, 0, [baseThickness, baseThickness, baseSpan]),
    ],
    column: part(item, 0, baseThickness, 0, [inches(2.5), seatBottom - baseThickness, inches(2.5)]),
    seat: part(item, 0, seatBottom, inches(3), [seatWidth, seatThickness, seatDepth]),
    back: part(item, 0, seatTop, -depth / 2 + backDepth / 2, [seatWidth, height - seatTop, backDepth]),
    arms: [-1, 1].flatMap((side) => [
      part(item, side * armLateral, seatTop, inches(2), [inches(1.5), armHeight, inches(1.5)]),
      part(item, side * armLateral, seatTop + armHeight, inches(3), [inches(2.5), inches(1.2), inches(10)]),
    ]),
  };
}
