/**
 * Room model types. All lengths are in feet (see docs/adr/0001-units-and-coordinates.md).
 *
 * Walls are named by compass direction. Each wall runs clockwise when viewed from above:
 *   north: NW → NE, east: NE → SE, south: SE → SW, west: SW → NW.
 * An opening's `offset` is the distance from its wall's start corner to the opening's near edge.
 */

export type WallId = 'north' | 'east' | 'south' | 'west';

export type OpeningKind = 'doorway' | 'window';

export interface Opening {
  readonly id: string;
  readonly kind: OpeningKind;
  readonly wall: WallId;
  /** Distance from the wall's start corner to the near edge of the opening. */
  readonly offset: number;
  readonly width: number;
  readonly height: number;
  /** Height of the bottom of the opening above the floor (0 for doorways). */
  readonly sill: number;
  /** True while the value is an estimate awaiting a real measurement. */
  readonly placeholder: boolean;
}

export interface Door {
  readonly id: string;
  /** The doorway this door leaf fills. */
  readonly openingId: string;
  /** Which end of the doorway the hinge is on, relative to the wall direction. */
  readonly hinge: 'start' | 'end';
  /** The door leaf swings into the room. */
  readonly swingsInward: true;
  /** Thickness of the door leaf. */
  readonly thickness: number;
  readonly placeholder: boolean;
}

export interface Beams {
  /** Walls that have a beam running along the top. */
  readonly walls: readonly WallId[];
  /** How far the beam drops below the ceiling. */
  readonly drop: number;
  /** How far the beam projects out from the wall face. */
  readonly depth: number;
  readonly placeholder: boolean;
}

export interface Walls {
  /** Wall thickness; walls grow outward from the interior faces, so the interior is unchanged. */
  readonly thickness: number;
  readonly placeholder: boolean;
}

export interface Skirting {
  /** How tall the skirting board is. */
  readonly height: number;
  /** How far its face stands off the wall. */
  readonly depth: number;
  readonly placeholder: boolean;
}

export type FittingKind = 'double-socket' | 'switch-plate' | 'data-plate' | 'ceiling-light';

/** A fixed electrical point, drawn as a flat plate on a Wall or the ceiling. */
export interface Fitting {
  readonly id: string;
  readonly kind: FittingKind;
  readonly surface: WallId | 'ceiling';
  /**
   * Centre of the plate. On a Wall: distance along it from its start corner, then height above
   * the floor. On the ceiling: distance from the west Wall, then from the north Wall.
   */
  readonly centre: readonly [number, number];
  /** Plate size. On a Wall: along it × up it. On the ceiling: west–east × south–north. */
  readonly size: readonly [number, number];
  readonly placeholder: boolean;
}

export interface Room {
  readonly name: string;
  /** Interior west–east span (length of the north and south walls). */
  readonly width: number;
  /** Interior south–north span (length of the east and west walls). */
  readonly depth: number;
  readonly ceilingHeight: number;
  readonly openings: readonly Opening[];
  readonly doors: readonly Door[];
  readonly beams: Beams;
  readonly walls: Walls;
  readonly skirting: Skirting;
  readonly fittings: readonly Fitting[];
}
