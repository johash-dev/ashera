/** Width (along the Wall it backs onto), height, depth — in feet. */
export type Size = readonly [number, number, number];

export type ItemTypeId =
  | 'tv-stand'
  | 'tv-55'
  | 'tv-65'
  | 'ps5'
  | 'soundbar'
  | 'desk'
  | 'monitor'
  | 'pc-tower'
  | 'keyboard'
  | 'mouse'
  | 'gaming-chair';

/** An Item type Asher can place: its name and real size. */
export interface ItemType {
  readonly id: ItemTypeId;
  readonly name: string;
  readonly size: Size;
  /** True while the size is a typical one, until the owner names a product model. */
  readonly placeholder: boolean;
}

/** Inches to feet, for sizes quoted in inches. */
const inches = (n: number) => n / 12;

/** How tall a TV's legs are, under the panel. */
export const TV_LEG_HEIGHT = inches(3);

/** Every Item type, by id. Item sizes live only here (docs/specs/tv-wall.md). */
export const CATALOG: Readonly<Record<ItemTypeId, ItemType>> = {
  'tv-stand': {
    id: 'tv-stand',
    name: 'TV stand',
    size: [8, 1.5, 1], // owner's sketch
    placeholder: false,
  },
  'tv-55': {
    id: 'tv-55',
    name: '55″ TV',
    size: [inches(48.4), inches(27.9) + TV_LEG_HEIGHT, inches(2)], // typical 55″ panel
    placeholder: true,
  },
  'tv-65': {
    id: 'tv-65',
    name: '65″ TV',
    size: [inches(57), inches(32.7) + TV_LEG_HEIGHT, inches(2)], // typical 65″ panel
    placeholder: true,
  },
  ps5: {
    id: 'ps5',
    name: 'PS5',
    size: [inches(3.8), inches(14.1), inches(8.5)], // PS5 slim, standing upright
    placeholder: true,
  },
  soundbar: {
    id: 'soundbar',
    name: 'Soundbar',
    size: [2.5, inches(2.6), inches(4)], // typical
    placeholder: true,
  },
  desk: {
    id: 'desk',
    name: 'Computer desk',
    size: [4, inches(30), 2], // owner: 4 × 2 ft; typical 30 in height until measured
    placeholder: true,
  },
  monitor: {
    id: 'monitor',
    name: 'Monitor 27″',
    size: [inches(24.1), inches(20), inches(8)], // typical 27″ panel on its stand
    placeholder: true,
  },
  'pc-tower': {
    id: 'pc-tower',
    name: 'PC tower',
    size: [inches(8.5), inches(18), inches(17)], // typical mid-size tower
    placeholder: true,
  },
  keyboard: {
    id: 'keyboard',
    name: 'Keyboard',
    size: [inches(17.5), inches(1.5), inches(5.5)], // typical full-size
    placeholder: true,
  },
  mouse: {
    id: 'mouse',
    name: 'Mouse',
    size: [inches(2.5), inches(1.5), inches(4.7)], // typical
    placeholder: true,
  },
  'gaming-chair': {
    id: 'gaming-chair',
    name: 'Gaming chair',
    size: [inches(27), inches(50), inches(27)], // typical
    placeholder: true,
  },
};

/** Doors across the front of the TV stand, side by side (owner's sketch). */
export const TV_STAND_DOORS = 2;

/** The Slat panel over the TV wall: a felt backing with vertical slats in front (typical acoustic panel). */
export const SLAT_PANEL = {
  slatWidth: inches(1),
  gap: inches(0.5),
  /** Overall depth, backing and slats together. */
  depth: inches(0.75),
  /** Depth of the felt backing; the slats make up the rest. */
  backingDepth: inches(0.25),
  /** Clearance left around each Fitting plate by its cut-out. */
  cutoutMargin: inches(0.5),
  placeholder: true,
} as const;
