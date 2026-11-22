import { floorBounds, type Room } from '../room';
import { CATALOG } from './catalog';
import { type Item } from './items';

/** The sofas Asher compares. */
export type SofaChoice = 'compact' | 'l';
export const SOFA_CHOICES: readonly SofaChoice[] = ['compact', 'l'];
const DEFAULT_SOFA: SofaChoice = 'compact';

/** The sofa asked for by `?sofa=compact|l`; the compact one when missing or unknown. */
export function sofaFromSearch(search: string): SofaChoice {
  const requested = new URLSearchParams(search).get('sofa');
  return SOFA_CHOICES.find((choice) => choice === requested) ?? DEFAULT_SOFA;
}

/**
 * The sofa: its long side against the south wall, west end in the window corner, facing north
 * towards the TV. The L-shaped sofa adds a short side on the window wall, facing east, touching
 * the long side's front (docs/specs/desk-and-sofa.md).
 */
export function sofaItems(room: Room, choice: SofaChoice): Item[] {
  const { minX, maxZ } = floorBounds(room);
  const type = choice === 'compact' ? 'sofa-compact' : 'sofa-l-long';
  const [width, height, depth] = CATALOG[type].size;
  const long: Item = {
    id: 'sofa',
    type,
    position: [minX + width / 2, height / 2, maxZ - depth / 2],
    size: CATALOG[type].size,
    facing: 'north',
  };
  if (choice === 'compact') return [long];

  const [shortWidth, shortHeight, shortDepth] = CATALOG['sofa-l-short'].size;
  return [
    long,
    {
      id: 'sofa-short',
      type: 'sofa-l-short',
      position: [minX + shortDepth / 2, shortHeight / 2, maxZ - depth - shortWidth / 2],
      size: CATALOG['sofa-l-short'].size,
      facing: 'east',
    },
  ];
}
