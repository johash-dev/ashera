/** Width (along the Wall it backs onto), height, depth — in feet. */
export type Size = readonly [number, number, number];

export type ItemTypeId = 'tv-stand' | 'tv-55' | 'tv-65';

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
};

/** Doors across the front of the TV stand, side by side (owner's sketch). */
export const TV_STAND_DOORS = 2;
