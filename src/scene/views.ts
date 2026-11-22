/**
 * Preset camera views. Positions are in scene units (feet), origin at the floor centre,
 * +x east, +y up, +z south (see docs/adr/0001-units-and-coordinates.md).
 * Selected with the `?view=<id>` URL parameter so tests and screenshots are deterministic.
 */
import { floorBounds, type Opening, type Room } from '../room';

export type ViewId = 'overview' | 'top' | 'entrance' | 'window' | 'left' | 'right';

/** Camera height of the photo Views: a standing person's eyes, in feet. */
export const EYE_HEIGHT = 5;
/** Vertical field of view of the photo Views, close to a phone's main camera held upright. */
const PHOTO_FOV = 65;

export interface CameraView {
  readonly id: ViewId;
  readonly label: string;
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
}

/** Photo Views aim slightly down, like a phone held at eye level. */
const AIM_DROP = 0.5;
/** How far the photo standpoints stand in from the Wall behind them. */
const STAND_OFF_ENTRANCE = 1.5;
const STAND_OFF = 1;
const STAND_OFF_FAR = 2;

function opening(room: Room, kind: Opening['kind']): Opening {
  const found = room.openings.find((o) => o.kind === kind);
  if (!found) throw new Error(`Room has no ${kind}.`);
  return found;
}

/**
 * Every View for a Room. The photo Views (standing spots and aims estimated from
 * docs/reference/photos; the owner confirms them) are placed relative to the Walls and Openings,
 * so they follow any change to room.config.ts.
 */
export function cameraViews(room: Room): Record<ViewId, CameraView> {
  const { minX, maxX, minZ, maxZ } = floorBounds(room);
  const doorway = opening(room, 'doorway'); // on the south Wall, measured west from the SE corner
  const windowOpening = opening(room, 'window'); // on the west Wall, measured north from the SW corner
  const doorwayCentreX = maxX - doorway.offset - doorway.width / 2;
  const doorwayWestX = maxX - doorway.offset - doorway.width;
  const windowCentreZ = maxZ - windowOpening.offset - windowOpening.width / 2;
  const aim = EYE_HEIGHT - AIM_DROP;
  return {
    overview: { id: 'overview', label: 'Overview', position: [15, 14, 19], target: [0, 3.5, 0], fov: 45 },
    top: { id: 'top', label: 'Top-down plan', position: [0, 30, 0.001], target: [0, 0, 0], fov: 40 },
    // entrance-view.jpeg: just inside the doorway, facing the TV wall.
    entrance: {
      id: 'entrance',
      label: 'Entrance',
      position: [doorwayCentreX, EYE_HEIGHT, maxZ - STAND_OFF_ENTRANCE],
      target: [0, aim, minZ],
      fov: PHOTO_FOV,
    },
    // window-view.jpeg: in front of the east Wall, facing the window.
    window: {
      id: 'window',
      label: 'Window',
      position: [maxX - STAND_OFF, EYE_HEIGHT, windowCentreZ],
      target: [minX, aim, windowCentreZ],
      fov: PHOTO_FOV,
    },
    // left-from-entrance.jpeg: north half, facing the solid stretch of the Door wall.
    left: {
      id: 'left',
      label: 'Left',
      position: [(minX + doorwayWestX) / 2, EYE_HEIGHT, minZ + STAND_OFF_FAR],
      target: [(minX + doorwayWestX) / 2, aim, maxZ],
      fov: PHOTO_FOV,
    },
    // right-from-entrance-door-open.jpeg: west half, facing the east Wall, aimed at the open Door's free edge.
    right: {
      id: 'right',
      label: 'Right',
      position: [minX + STAND_OFF_FAR, EYE_HEIGHT, 0],
      target: [maxX, aim, maxZ - doorway.width],
      fov: PHOTO_FOV,
    },
  };
}

/** Every View, in the order of the Header buttons. */
export const VIEW_ORDER: readonly ViewId[] = ['overview', 'top', 'entrance', 'window', 'left', 'right'];

export const DEFAULT_VIEW: ViewId = 'overview';

export function isViewId(value: string | null): value is ViewId {
  return value !== null && VIEW_ORDER.some((id) => id === value);
}

/** Resolves the view from a URL search string, falling back to the default. */
export function viewFromSearch(views: Record<ViewId, CameraView>, search: string): CameraView {
  const requested = new URLSearchParams(search).get('view');
  return views[isViewId(requested) ? requested : DEFAULT_VIEW];
}
