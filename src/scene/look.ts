/** The dark look: every colour in the scene. One restrained accent, everything else near-black. */
export const LOOK = {
  background: '#0b0b10',
  wall: '#33364a',
  skirting: '#1f212b',
  floor: '#1d1e27',
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
  /** Slat panel: black slats a shade lighter than the felt behind them, so the ribs read. */
  slat: '#17181f',
  slatBacking: '#050507',
  /** Soft white of the ceiling panel light and the light it casts. */
  ceilingLight: '#e8e6ff',
  /** The one accent colour, shared with the Header (--accent in styles.css): the floor-tile joints. */
  accent: '#7c5cff',
} as const;

/** Opacity of the floor-tile joints; faint on purpose. */
export const TILE_LINE_OPACITY = 0.18;
/** How strongly the TV's edge glows, so it reads against the dark Wall. */
export const TV_EDGE_GLOW = 0.6;
/** How strongly the ceiling panel glows. */
export const CEILING_LIGHT_GLOW = 1.5;
/** Brightness of the light cast from each ceiling light, and the distance (ft) at which it fades out. */
export const CEILING_LIGHT_INTENSITY = 60;
export const CEILING_LIGHT_RANGE = 16;
/** Faint fill so the shadowed side of the Room never goes fully black. */
export const AMBIENT_INTENSITY = 0.25;
export const KEY_LIGHT_INTENSITY = 0.5;
