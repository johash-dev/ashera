import { clearHeightAtWall, floorBounds, type Room } from '../room';
import { SLAT_PANEL } from './catalog';

/** A box in scene coordinates (feet): centre and full size. */
export interface PanelBox {
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number, number];
}

/** A rectangle left open in the Slat panel, in scene x and height above the floor (feet). */
export interface Cutout {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** One cut-out around each TV-wall Fitting plate, with a margin all round. */
export function slatPanelCutouts(room: Room): Cutout[] {
  const { minX } = floorBounds(room);
  const m = SLAT_PANEL.cutoutMargin;
  return room.fittings
    .filter((fitting) => fitting.surface === 'north')
    .map(({ centre: [along, up], size: [width, height] }) => ({
      minX: minX + along - width / 2 - m,
      maxX: minX + along + width / 2 + m,
      minY: up - height / 2 - m,
      maxY: up + height / 2 + m,
    }));
}

/** How high a column at `xMin`–`xMax` can reach: the ceiling, or a Beam's underside where an end Wall's Beam projects over it. */
function columnTop(room: Room, xMin: number, xMax: number): number {
  const { minX, maxX } = floorBounds(room);
  const { depth } = room.beams;
  return Math.min(
    room.ceilingHeight,
    xMin < minX + depth ? clearHeightAtWall(room, 'west') : room.ceilingHeight,
    xMax > maxX - depth ? clearHeightAtWall(room, 'east') : room.ceilingHeight,
  );
}

/** The vertical spans of a column from the floor to its top, skipping the cut-outs it crosses. */
function columnSpans(room: Room, cutouts: readonly Cutout[], xMin: number, xMax: number): [number, number][] {
  const top = columnTop(room, xMin, xMax);
  const blocked = cutouts.filter((c) => xMin < c.maxX && xMax > c.minX).sort((a, b) => a.minY - b.minY);
  const spans: [number, number][] = [];
  let from = 0;
  for (const c of blocked) {
    if (c.minY > from) spans.push([from, c.minY]);
    from = Math.max(from, c.maxY);
  }
  if (from < top) spans.push([from, top]);
  return spans;
}

/** Centres (scene x) of the slat columns across the TV wall, as many as fit, centred corner to corner. */
function columnCentres(room: Room): number[] {
  const pitch = SLAT_PANEL.slatWidth + SLAT_PANEL.gap;
  const count = Math.floor((room.width + SLAT_PANEL.gap) / pitch);
  const first = -((count - 1) * pitch) / 2;
  return Array.from({ length: count }, (_, i) => first + i * pitch);
}

/** Pieces of the panel, one per span of each column: `width` wide, `depth` deep, front face at `front`. */
function pieces(room: Room, width: number, depth: number, front: number): PanelBox[] {
  const cutouts = slatPanelCutouts(room);
  const { minX, maxX } = floorBounds(room);
  const centreX = (minX + maxX) / 2;
  return columnCentres(room).flatMap((dx) => {
    const x = centreX + dx;
    return columnSpans(room, cutouts, x - width / 2, x + width / 2).map(([bottom, top]): PanelBox => ({
      position: [x, (bottom + top) / 2, front - depth / 2],
      size: [width, top - bottom, depth],
    }));
  });
}

/** The slats: vertical pieces 1 in wide making up the panel's front, broken around each cut-out. */
export function slatPanelSlats(room: Room): PanelBox[] {
  const { minZ } = floorBounds(room);
  return pieces(
    room,
    SLAT_PANEL.slatWidth,
    SLAT_PANEL.depth - SLAT_PANEL.backingDepth,
    minZ + SLAT_PANEL.depth,
  );
}

/** The felt backing behind the slats, one strip per slat column so the gaps read dark; open at the cut-outs too. */
export function slatPanelBacking(room: Room): PanelBox[] {
  const { minZ } = floorBounds(room);
  const pitch = SLAT_PANEL.slatWidth + SLAT_PANEL.gap;
  return pieces(room, pitch, SLAT_PANEL.backingDepth, minZ + SLAT_PANEL.backingDepth);
}
