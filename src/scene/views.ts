/**
 * Preset camera views. Positions are in scene units (feet), origin at the floor centre,
 * +x east, +y up, +z south (see docs/adr/0001-units-and-coordinates.md).
 * Selected with the `?view=<id>` URL parameter so tests and screenshots are deterministic.
 */
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

export const VIEWS: Record<ViewId, CameraView> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    position: [15, 14, 19],
    target: [0, 3.5, 0],
    fov: 45,
  },
  top: {
    id: 'top',
    label: 'Top-down plan',
    position: [0, 30, 0.001],
    target: [0, 0, 0],
    fov: 40,
  },
  // Photo Views: standing spots and aims estimated from docs/reference/photos (owner confirms).
  entrance: {
    id: 'entrance',
    label: 'Entrance',
    position: [1.5, EYE_HEIGHT, 4], // just inside the doorway (entrance-view.jpeg)
    target: [0.5, 4.5, -4.5], // the TV wall
    fov: PHOTO_FOV,
  },
  window: {
    id: 'window',
    label: 'Window',
    position: [4, EYE_HEIGHT, 0], // near the east Wall, centred (window-view.jpeg)
    target: [-5, 4.5, 0], // the window
    fov: PHOTO_FOV,
  },
  left: {
    id: 'left',
    label: 'Left',
    position: [-1.5, EYE_HEIGHT, -2.5], // north half of the Room (left-from-entrance.jpeg)
    target: [-1.5, 4.5, 4.5], // the Door wall
    fov: PHOTO_FOV,
  },
  right: {
    id: 'right',
    label: 'Right',
    position: [-3, EYE_HEIGHT, 0.3], // west half of the Room (right-from-entrance-door-open.jpeg)
    target: [5, 4.5, 1.5], // the east Wall, open Door to the right
    fov: PHOTO_FOV,
  },
};

/** The Views matching the reference photos, in the order of the Header buttons. */
export const PHOTO_VIEWS: readonly ViewId[] = ['entrance', 'window', 'left', 'right'];

export const DEFAULT_VIEW: ViewId = 'overview';

export function isViewId(value: string | null): value is ViewId {
  return value !== null && Object.hasOwn(VIEWS, value);
}

/** Resolves the view from a URL search string, falling back to the default. */
export function viewFromSearch(search: string): CameraView {
  const requested = new URLSearchParams(search).get('view');
  return VIEWS[isViewId(requested) ? requested : DEFAULT_VIEW];
}
