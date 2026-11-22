import { floorBounds, type Room } from '../room';
import { CATALOG, SLAT_PANEL } from './catalog';
import { type Item } from './items';

/** The TV sizes Asher compares. */
export type TvSize = 55 | 65;
export const TV_SIZES: readonly TvSize[] = [55, 65];
const DEFAULT_TV_SIZE: TvSize = 55;

/** The floating stand hangs this far above the floor (owner's sketch). */
const STAND_UNDERSIDE = 0.5;
/** The TV's back sits this far in front of the stand's back, leaving the front free for the soundbar. */
const TV_SET_BACK = 0.25;
/** The PS5's west side sits this far in from the stand's west end. */
const PS5_IN_FROM_WEST = 1;

/** Items on the TV wall stand off the Slat panel face, not the bare Wall. */
function slatPanelFace(room: Room): number {
  return floorBounds(room).minZ + SLAT_PANEL.depth;
}

/** How far south the TV stand's front reaches. */
export function tvStandFront(room: Room): number {
  return slatPanelFace(room) + CATALOG['tv-stand'].size[2];
}

/** The fixed Items of the TV wall, all facing south, placed from the Room and the Catalog. */
export function tvWallItems(room: Room, tvSize: TvSize): Item[] {
  const { minX, maxX } = floorBounds(room);
  const panelFace = slatPanelFace(room);
  const centreX = (minX + maxX) / 2;

  const standSize = CATALOG['tv-stand'].size;
  const standTop = STAND_UNDERSIDE + standSize[1];
  const tvType = tvSize === 55 ? 'tv-55' : 'tv-65';
  const tv = CATALOG[tvType].size;
  const ps5 = CATALOG.ps5.size;
  const bar = CATALOG.soundbar.size;
  const standFront = tvStandFront(room);

  return [
    {
      id: 'tv-stand',
      type: 'tv-stand',
      position: [centreX, STAND_UNDERSIDE + standSize[1] / 2, panelFace + standSize[2] / 2],
      size: standSize,
      facing: 'south',
    },
    {
      id: 'tv',
      type: tvType,
      position: [centreX, standTop + tv[1] / 2, panelFace + TV_SET_BACK + tv[2] / 2],
      size: tv,
      facing: 'south',
    },
    {
      id: 'ps5',
      type: 'ps5',
      position: [
        centreX - standSize[0] / 2 + PS5_IN_FROM_WEST + ps5[0] / 2,
        standTop + ps5[1] / 2,
        panelFace + standSize[2] / 2,
      ],
      size: ps5,
      facing: 'south',
    },
    {
      id: 'soundbar',
      type: 'soundbar',
      position: [centreX, standTop + bar[1] / 2, standFront - bar[2] / 2],
      size: bar,
      facing: 'south',
    },
  ];
}

/** The TV size asked for by `?tv=55|65`; 55 when missing or unknown. */
export function tvSizeFromSearch(search: string): TvSize {
  const requested = Number(new URLSearchParams(search).get('tv'));
  return TV_SIZES.find((size) => size === requested) ?? DEFAULT_TV_SIZE;
}
