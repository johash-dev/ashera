import type { Room } from './types';

/**
 * Asher's gaming room — the single source of truth for every measurement.
 * Units: feet. Narrative and sources: docs/room-spec.md. Photos: docs/reference/.
 * Values with `placeholder: true` are estimates until measured.
 */
export const ASHERS_ROOM: Room = {
  name: "Asher's gaming room",
  width: 10,
  depth: 9,
  ceilingHeight: 9.5,
  skirting: {
    height: 0.3, // about 3½ in
    depth: 0.05, // ⅝ in
    placeholder: true, // depth not measured yet
  },
  walls: {
    thickness: 0.5, // 6 in, measured at the doorway jamb; grows outward from the interior faces
    placeholder: false,
  },
  openings: [
    {
      id: 'doorway',
      kind: 'doorway',
      wall: 'south',
      offset: 0, // starts at the south-east corner
      width: 37 / 12, // 3′ 1″ inside the ~1″ frame, which is drawn as part of the Wall
      height: 43 / 12, // 7′ 2″
      sill: 0,
      placeholder: false,
    },
    {
      id: 'window',
      kind: 'window',
      wall: 'west',
      offset: 1.625, // centred on the 9 ft wall
      width: 5.75, // 5′ 9″
      height: 5.5, // 5′ 6″; top meets the Beam underside at 9 ft
      sill: 3.5,
      placeholder: true, // sill and position not measured yet
    },
  ],
  doors: [
    {
      id: 'door',
      openingId: 'doorway',
      hinge: 'start',
      swingsInward: true,
      thickness: 0.125, // 1½ in
      placeholder: true, // thickness not measured yet
    },
  ],
  beams: {
    walls: ['west', 'south', 'east'],
    drop: 0.5,
    depth: 0.75,
    placeholder: true, // depth not measured yet
  },
  // Positions and sizes estimated from the photos; plates 0.48 × 0.28 ft (double) or 0.28 ft square.
  fittings: [
    {
      id: 'tv-socket',
      kind: 'double-socket',
      surface: 'north',
      centre: [4.1, 1], // from the north-west corner, just above the Skirting
      size: [0.48, 0.28],
      placeholder: true,
    },
    {
      id: 'tv-data',
      kind: 'data-plate',
      surface: 'north',
      centre: [4.3, 5],
      size: [0.28, 0.28],
      placeholder: true,
    },
    {
      id: 'door-switch',
      kind: 'switch-plate',
      surface: 'south',
      centre: [4.2, 4.2], // from the south-east corner, just west of the doorway
      size: [0.28, 0.28],
      placeholder: true,
    },
    {
      id: 'door-socket',
      kind: 'double-socket',
      surface: 'south',
      centre: [3.9, 1],
      size: [0.48, 0.28],
      placeholder: true,
    },
    {
      id: 'ceiling-light',
      kind: 'ceiling-light',
      surface: 'ceiling',
      centre: [5, 4.5], // centred on the ceiling
      size: [2, 2],
      placeholder: true,
    },
  ],
};
