/** The look: every colour in the scene. A light room (white walls and floor, grey east Wall) with dark furniture and one restrained accent. */
export const LOOK = {
  background: '#0b0b10',
  wall: '#f2f2f4',
  /** The east (PC) Wall, mid grey. */
  wallGrey: '#8a8d94',
  /** Dark wood skirting, as in the photos. */
  skirting: '#3a2616',
  floor: '#e6e8ec',
  fitting: '#8a8fb0',
  windowFrame: '#5c6080',
  windowGlass: '#10142a',
  /** Brown wood of the Door leaf, as in docs/reference/photos. */
  doorWood: '#7a4a28',
  /** The floating TV stand: near-black body, its doors a shade lighter so the seams show. */
  standBody: '#101016',
  standDoor: '#262838',
  /** The TV: a dark glossy screen inside a faint, slightly lit edge. */
  tvScreen: '#050508',
  tvEdge: '#4a4d66',
  /** PS5: white side panels around a black core. */
  ps5Side: '#c9cbd6',
  ps5Core: '#08080c',
  /** Soundbar: near-black body, its front grille a shade lighter. */
  soundbarBody: '#0e0e13',
  soundbarGrille: '#30323f',
  /** Computer desk: a dark top a shade lighter than the floor, on darker legs, until the owner says what the real desk looks like. */
  deskTop: '#2e3040',
  deskLeg: '#1c1d27',
  /** Desk setup: near-black PC gear (monitor, tower, keyboard, mouse) with lighter fronts and keys; the gaming chair a shade lighter than the floor. */
  deviceBody: '#121218',
  deviceTrim: '#2a2c3a',
  chairBody: '#1a1b24',
  chairTrim: '#2e3042',
  /** PC tower's dark glass side panel, and the chair's accent stripes (a dim violet, no glow). */
  deviceGlass: '#07080d',
  chairStripe: '#4b3a9a',
  /** Sofa: dark charcoal fabric, the seat cushions a shade lighter so they read against the frame. */
  sofaFrame: '#20222e',
  sofaCushion: '#2b2d3c',
  /** Rug: dark, with a faint violet cast, a shade lighter than the floor so its edge reads. */
  rug: '#2a2840',
  /** The rug's darker border and the dim accent line round it. */
  rugBorder: '#1e1d30',
  rugLine: '#3b3070',
  /** Pegboard: a black board that stands out against the lighter wall tiles. */
  pegboard: '#15161d',
  /** The pegboard's frame, a shade lighter than its board, and the mat inside each picture frame. */
  pegboardRim: '#262731',
  frameMat: '#23243a',
  /** Picture frames: black frames around dark art, with a faint accent line so they read. */
  frame: '#0c0c11',
  frameArt: '#1c1d2a',
  frameLine: '#5a4aa8',
  /** Slat panel: black slats a shade lighter than the felt behind them, so the ribs read. */
  slat: '#17181f',
  slatBacking: '#050507',
  /** Soft white of the ceiling panel light and the light it casts. */
  ceilingLight: '#e8e6ff',
  /** Faint grey grout between the floor tiles. */
  tileLine: '#8a8d94',
  /** The one accent colour, shared with the Header (--accent in styles.css): small glowing details. */
  accent: '#7c5cff',
} as const;

/** Opacity of the floor-tile joints; faint on purpose. */
export const TILE_LINE_OPACITY = 0.18;
/** How strongly the TV's edge glows, so it reads against the dark Wall. */
export const TV_EDGE_GLOW = 0.6;
/** How strongly small accent lights (tower strip, monitor light, mouse wheel) glow. */
export const ACCENT_GLOW = 1.5;
/** How strongly the ceiling panel glows. */
export const CEILING_LIGHT_GLOW = 2.5;
/** Brightness of the light cast from each ceiling light, and the distance (ft) at which it fades out. */
export const CEILING_LIGHT_INTENSITY = 110;
export const CEILING_LIGHT_RANGE = 16;
/** Faint fill so the shadowed side of the Room never goes fully black. */
export const AMBIENT_INTENSITY = 0.6;
export const KEY_LIGHT_INTENSITY = 0.5;
