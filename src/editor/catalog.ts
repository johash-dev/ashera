/** Width (along the Wall it backs onto), height, depth — in feet. */
export type Size = readonly [number, number, number];

export type ItemTypeId = 'tv-stand';

/** An Item type Asher can place: its name and real size. */
export interface ItemType {
  readonly id: ItemTypeId;
  readonly name: string;
  readonly size: Size;
  /** Doors across the front, side by side. */
  readonly doors: number;
  /** True while the size is a typical one, until the owner names a product model. */
  readonly placeholder: boolean;
}

/** Every Item type, by id. Item sizes live only here (docs/specs/tv-wall.md). */
export const CATALOG: Readonly<Record<ItemTypeId, ItemType>> = {
  'tv-stand': {
    id: 'tv-stand',
    name: 'TV stand',
    size: [8, 1.5, 1], // owner's sketch
    doors: 2,
    placeholder: false,
  },
};
