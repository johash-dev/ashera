import { type Facing, inches, type ItemTypeId, type Item, itemBox } from '../editor';
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
/** Under-top rails (aprons) along the front and back; low stretchers between the legs at each end. */
const DESK_APRON_HEIGHT = 0.3;
const DESK_APRON_THICKNESS = 0.06;
const DESK_STRETCHER_HEIGHT = 0.1;
const DESK_STRETCHER_THICKNESS = 0.06;
const DESK_STRETCHER_BOTTOM = 0.6;

/**
 * A desk: its top over the whole footprint, four square legs under its corners, an apron under the
 * top along the front and the back, and a low stretcher between the legs at each end.
 */
export function deskBoxes(item: Item): { top: Box; legs: Box[]; rails: Box[] } {
  const { position, size } = itemBox(item);
  const [x, y, z] = position;
  const [width, height, depth] = size;
  const floor = y - height / 2;
  const legHeight = height - DESK_TOP_THICKNESS;
  const legX = width / 2 - DESK_LEG / 2;
  const legZ = depth / 2 - DESK_LEG / 2;
  const betweenX = width - 2 * DESK_LEG;
  const betweenZ = depth - 2 * DESK_LEG;
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
    rails: [
      ...[-1, 1].map((sx): Box => ({
        position: [
          x + sx * (width / 2 - DESK_APRON_THICKNESS / 2),
          floor + legHeight - DESK_APRON_HEIGHT / 2,
          z,
        ],
        size: [DESK_APRON_THICKNESS, DESK_APRON_HEIGHT, betweenZ],
      })),
      ...[-1, 1].map((sz): Box => ({
        position: [x, floor + DESK_STRETCHER_BOTTOM + DESK_STRETCHER_HEIGHT / 2, z + sz * legZ],
        size: [betweenX, DESK_STRETCHER_HEIGHT, DESK_STRETCHER_THICKNESS],
      })),
    ],
  };
}

type Vec3 = Box['size'];

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

/**
 * A monitor: a flat foot, a neck, the panel near the back with a housing behind it, the screen on the
 * panel's front and a small status light in the bottom bezel.
 */
export function monitorBoxes(item: Item): {
  foot: Box;
  neck: Box;
  panel: Box;
  back: Box;
  screen: Box;
  led: Box;
} {
  const [width, height, depth] = item.size;
  const footHeight = inches(0.6);
  const panelHeight = inches(14.2);
  const panelDepth = inches(1);
  const bezel = inches(0.4);
  const panelBottom = height - panelHeight;
  const panelForward = -depth / 2 + inches(2);
  const backDepth = inches(1.2);
  const backForward = panelForward - panelDepth / 2 - backDepth / 2;
  const ledSize = inches(0.1);
  return {
    foot: part(item, 0, 0, 0, [inches(12), footHeight, depth - inches(1)]),
    neck: part(item, 0, footHeight, backForward, [
      inches(2.5),
      panelBottom - footHeight + inches(4),
      backDepth,
    ]),
    panel: part(item, 0, panelBottom, panelForward, [width, panelHeight, panelDepth]),
    back: part(item, 0, panelBottom + inches(3), backForward, [inches(13), inches(8), backDepth]),
    screen: part(item, 0, panelBottom + bezel, panelForward + panelDepth / 2 + inches(0.05), [
      width - 2 * bezel,
      panelHeight - 2 * bezel,
      inches(0.1),
    ]),
    led: part(item, inches(10), panelBottom + ledSize, panelForward + panelDepth / 2 + inches(0.05), [
      inches(0.4),
      ledSize,
      inches(0.1),
    ]),
  };
}

/** Headphones on a hook: a band across the top, a cup at each end and the hook behind the band. */
export function headphonesBoxes(item: Item): { band: Box; cups: Box[]; hook: Box } {
  const [width, height, depth] = item.size;
  const bandHeight = inches(1);
  const cupWidth = inches(2);
  const hookDepth = inches(1);
  return {
    band: part(item, 0, height - bandHeight, 0, [width, bandHeight, inches(1)]),
    cups: [-1, 1].map((side) =>
      part(item, (side * (width - cupWidth)) / 2, 0, 0, [cupWidth, height - bandHeight, depth]),
    ),
    hook: part(item, 0, height - bandHeight, -depth / 2 + hookDepth / 2, [
      inches(0.6),
      bandHeight,
      hookDepth,
    ]),
  };
}

/**
 * A picture frame: the black body at the back, the dark art inset in front of it leaving a border,
 * and a thin accent line across the art.
 */
export function frameBoxes(item: Item): { body: Box; art: Box; line: Box } {
  const [width, height, depth] = item.size;
  const border = inches(1.2);
  const artDepth = inches(0.2);
  const lineDepth = inches(0.1);
  const lineHeight = inches(0.4);
  const bodyDepth = depth - artDepth - lineDepth;
  return {
    body: part(item, 0, 0, -depth / 2 + bodyDepth / 2, [width, height, bodyDepth]),
    art: part(item, 0, border, -depth / 2 + bodyDepth + artDepth / 2, [
      width - 2 * border,
      height - 2 * border,
      artDepth,
    ]),
    line: part(item, 0, (height - lineHeight) / 2, depth / 2 - lineDepth / 2, [
      width - 4 * border,
      lineHeight,
      lineDepth,
    ]),
  };
}

/** Thickness of a PC tower's front panel and the height of its rubber feet. */
const TOWER_FRONT = inches(0.5);
const TOWER_FEET = inches(0.5);
/** Thickness of the glass side panel (north side). */
const TOWER_GLASS = inches(0.2);

/**
 * A PC tower on two feet: the body, a lighter front panel with air-vent slots and a glowing accent strip,
 * and a dark glass side panel on its north face. Facing west, its front is its west face.
 */
export function towerBoxes(item: Item): {
  body: Box;
  front: Box;
  vents: Box[];
  strip: Box;
  glass: Box;
  feet: Box[];
} {
  const [width, height, depth] = item.size;
  const bodyHeight = height - TOWER_FEET;
  const ventDepth = inches(0.1);
  return {
    body: part(item, -TOWER_GLASS / 2, TOWER_FEET, -TOWER_FRONT / 2, [
      width - TOWER_GLASS,
      bodyHeight,
      depth - TOWER_FRONT,
    ]),
    front: part(item, 0, TOWER_FEET, depth / 2 - TOWER_FRONT / 2 - ventDepth / 2, [
      width,
      bodyHeight,
      TOWER_FRONT - ventDepth,
    ]),
    vents: Array.from({ length: 5 }, (_, i) =>
      part(item, -inches(0.5), TOWER_FEET + inches(2 + i * 0.8), depth / 2 - ventDepth / 2, [
        width - inches(3),
        inches(0.3),
        ventDepth,
      ]),
    ),
    strip: part(
      item,
      width / 2 - inches(0.9),
      TOWER_FEET + inches(3),
      depth / 2 - inches(0.075) - ventDepth / 2,
      [inches(0.3), bodyHeight - inches(6), inches(0.15)],
    ),
    glass: part(item, width / 2 - TOWER_GLASS / 2, TOWER_FEET + inches(0.5), -TOWER_FRONT / 2, [
      TOWER_GLASS,
      bodyHeight - inches(1),
      depth - TOWER_FRONT - inches(1),
    ]),
    feet: [-1, 1].map((side) =>
      part(item, side * (width / 2 - inches(1)), 0, 0, [inches(1), TOWER_FEET, depth - inches(2)]),
    ),
  };
}

/** Rows of keys on a keyboard, and the gap between rows (feet). */
const KEY_ROWS = 5;
const KEY_ROW_GAP = inches(0.15);

/** A keyboard: a low body and five rows of keys on top, the gaps between rows showing the body. */
export function keyboardBoxes(item: Item): { body: Box; rows: Box[] } {
  const [width, height, depth] = item.size;
  const rim = inches(0.4);
  const bodyHeight = inches(1);
  const rowDepth = (depth - 2 * rim - (KEY_ROWS - 1) * KEY_ROW_GAP) / KEY_ROWS;
  return {
    body: part(item, 0, 0, 0, [width, bodyHeight, depth]),
    rows: Array.from({ length: KEY_ROWS }, (_, i) =>
      part(item, 0, bodyHeight, -depth / 2 + rim + rowDepth / 2 + i * (rowDepth + KEY_ROW_GAP), [
        width - 2 * rim,
        height - bodyHeight,
        rowDepth,
      ]),
    ),
  };
}

/** A mouse: a low shell, a raised hump at the back, two buttons at the front and a scroll wheel between them. */
export function mouseBoxes(item: Item): { shell: Box; hump: Box; buttons: Box[]; wheel: Box } {
  const [width, height, depth] = item.size;
  const shellHeight = inches(0.7);
  const humpDepth = inches(2.8);
  const buttonGap = inches(0.1);
  const buttonDepth = depth - humpDepth;
  const buttonWidth = (width - buttonGap) / 2;
  const wheelDepth = inches(0.8);
  return {
    shell: part(item, 0, 0, 0, [width, shellHeight, depth]),
    hump: part(item, 0, shellHeight, -depth / 2 + humpDepth / 2, [
      width,
      height - inches(0.2) - shellHeight,
      humpDepth,
    ]),
    buttons: [-1, 1].map((side) =>
      part(item, (side * (buttonWidth + buttonGap)) / 2, shellHeight, depth / 2 - buttonDepth / 2, [
        buttonWidth,
        inches(0.5),
        buttonDepth,
      ]),
    ),
    wheel: part(item, 0, shellHeight, depth / 2 - buttonDepth - wheelDepth / 2, [
      inches(0.3),
      height - shellHeight,
      wheelDepth,
    ]),
  };
}

/** A box turned about the vertical axis; a positive angle turns its x axis towards -z. */
export interface YawedBox extends Box {
  readonly yawRad: number;
}

/** Legs in a chair's star base, and how far each reaches from the centre (feet). */
const CHAIR_LEGS = 5;
const CHAIR_LEG_REACH = inches(12.5);

/**
 * A gaming chair: a five-star base on casters, a column, a seat with side bolsters, a tall backrest with
 * a headrest and side wings, two accent stripes on the backrest's front, and two armrests.
 */
export function chairBoxes(item: Item): {
  base: YawedBox[];
  casters: Box[];
  column: Box;
  seat: Box;
  bolsters: Box[];
  back: Box;
  headrest: Box;
  wings: Box[];
  stripes: Box[];
  arms: Box[];
} {
  const [, height, depth] = item.size;
  const [x, y, z] = item.position;
  const floor = y - height / 2;
  const [fx, fz] = FRONT[item.facing];
  const frontAngle = Math.atan2(fz, fx);
  const legAngle = (i: number) => frontAngle + (i * 2 * Math.PI) / CHAIR_LEGS;
  const casterSize = inches(1.6);
  const legHeight = inches(1.2);
  const legBottom = casterSize - inches(0.6);
  const baseTop = legBottom + legHeight;
  const seatBottom = inches(17);
  const seatThickness = inches(3.5);
  const seatWidth = inches(20);
  const seatDepth = inches(20);
  const seatTop = seatBottom + seatThickness;
  const backBottom = inches(21);
  const backHeight = inches(25);
  const backDepth = inches(4);
  const backForward = -depth / 2 + backDepth / 2;
  const headrestHeight = height - (backBottom + backHeight - inches(2.5));
  return {
    base: Array.from({ length: CHAIR_LEGS }, (_, i): YawedBox => ({
      position: [
        x + (Math.cos(legAngle(i)) * CHAIR_LEG_REACH) / 2,
        floor + legBottom + legHeight / 2,
        z + (Math.sin(legAngle(i)) * CHAIR_LEG_REACH) / 2,
      ],
      size: [CHAIR_LEG_REACH, legHeight, inches(1.8)],
      yawRad: -legAngle(i),
    })),
    casters: Array.from({ length: CHAIR_LEGS }, (_, i): Box => {
      const reach = CHAIR_LEG_REACH - casterSize / 2;
      return {
        position: [
          x + Math.cos(legAngle(i)) * reach,
          floor + casterSize / 2,
          z + Math.sin(legAngle(i)) * reach,
        ],
        size: [casterSize, casterSize, casterSize],
      };
    }),
    column: part(item, 0, baseTop, 0, [inches(2.5), seatBottom - baseTop, inches(2.5)]),
    seat: part(item, 0, seatBottom, inches(3), [seatWidth, seatThickness, seatDepth]),
    bolsters: [-1, 1].map((side) =>
      part(item, side * inches(8.75), seatTop, inches(3.5), [inches(2.5), inches(1.5), inches(17)]),
    ),
    back: part(item, 0, backBottom, backForward, [seatWidth - inches(1), backHeight, backDepth]),
    headrest: part(item, 0, height - headrestHeight, backForward, [inches(10), headrestHeight, inches(3.5)]),
    wings: [-1, 1].map((side) =>
      part(item, side * inches(8.5), backBottom + inches(8), -depth / 2 + inches(3.5), [
        inches(3),
        inches(12),
        inches(7),
      ]),
    ),
    stripes: [-1, 1].map((side) =>
      part(item, side * inches(3.5), backBottom + inches(1), -depth / 2 + backDepth + inches(0.075), [
        inches(0.8),
        backHeight - inches(2),
        inches(0.15),
      ]),
    ),
    arms: [-1, 1].flatMap((side) => [
      part(item, side * inches(11.5), seatTop, inches(2), [inches(1.5), inches(7), inches(1.5)]),
      part(item, side * inches(11.5), seatTop + inches(7), inches(3), [inches(2.5), inches(1.2), inches(10)]),
    ]),
  };
}

/** Which end of a sofa piece an armrest stands at: -1 is the left end, 1 the right, as seen from the front. */
export type ArmSide = -1 | 1;

/**
 * Where each sofa piece has its arms. The L-shaped sofa's two sides join at the corner, so each has an
 * arm only at its free end: the long side (facing north) at its east end, the short side (facing east)
 * at its north end.
 */
export function sofaArmSides(type: ItemTypeId): readonly ArmSide[] {
  switch (type) {
    case 'sofa-l-long':
      return [1];
    case 'sofa-l-short':
      return [-1];
    default:
      return [-1, 1];
  }
}

/** Seats wider than this get another cushion (feet). */
const CUSHION_WIDTH = 2.2;

/** A sofa piece: a low base, a low back, slim arms at the given ends, and seat cushions between them. */
export function sofaBoxes(
  item: Item,
  armSides: readonly ArmSide[],
): { base: Box; back: Box; arms: Box[]; cushions: Box[] } {
  const [width, height, depth] = item.size;
  const baseHeight = inches(14);
  const armWidth = inches(5);
  const armHeight = inches(10);
  const backDepth = inches(10);
  const cushionHeight = inches(5);
  const cushionGap = inches(0.5);
  const left = armSides.includes(-1) ? armWidth : 0;
  const right = armSides.includes(1) ? armWidth : 0;
  const seatWidth = width - left - right;
  const seatCentre = (left - right) / 2;
  const cushionCount = Math.max(1, Math.round(seatWidth / CUSHION_WIDTH));
  const cushionWidth = (seatWidth - (cushionCount - 1) * cushionGap) / cushionCount;
  const cushionDepth = depth - backDepth;
  return {
    base: part(item, 0, 0, 0, [width, baseHeight, depth]),
    back: part(item, seatCentre, baseHeight, -depth / 2 + backDepth / 2, [
      seatWidth,
      height - baseHeight,
      backDepth,
    ]),
    arms: armSides.map((side) =>
      part(item, side * (width / 2 - armWidth / 2), baseHeight, 0, [armWidth, armHeight, depth]),
    ),
    cushions: Array.from({ length: cushionCount }, (_, i) =>
      part(
        item,
        seatCentre - seatWidth / 2 + cushionWidth / 2 + i * (cushionWidth + cushionGap),
        baseHeight,
        backDepth / 2,
        [cushionWidth, cushionHeight, cushionDepth],
      ),
    ),
  };
}
