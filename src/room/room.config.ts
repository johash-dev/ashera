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
  skirtingHeight: 0.3,
  walls: {
    thickness: 0.5, // grows outward from the interior faces
    placeholder: true, // measure at the doorway jamb
  },
  openings: [
    {
      id: 'doorway',
      kind: 'doorway',
      wall: 'south',
      offset: 0, // starts at the south-east corner
      width: 3,
      height: 7,
      sill: 0,
      placeholder: true, // height not measured yet
    },
    {
      id: 'window',
      kind: 'window',
      wall: 'west',
      offset: 2.25, // centred on the 9 ft wall
      width: 4.5,
      height: 4,
      sill: 3.5,
      placeholder: true,
    },
  ],
  doors: [{ id: 'door', openingId: 'doorway', hinge: 'start', swingsInward: true }],
  beams: {
    walls: ['west', 'south', 'east'],
    drop: 0.5,
    depth: 0.75,
    placeholder: true, // depth not measured yet
  },
};
