/**
 * Preset camera views. Positions are in scene units (feet), origin at the floor centre,
 * +x east, +y up, +z south (see docs/adr/0001-units-and-coordinates.md).
 * Selected with the `?view=<id>` URL parameter so tests and screenshots are deterministic.
 */
export type ViewId = 'overview' | 'top';

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
};

export const DEFAULT_VIEW: ViewId = 'overview';

export function isViewId(value: string | null): value is ViewId {
  return value !== null && Object.hasOwn(VIEWS, value);
}

/** Resolves the view from a URL search string, falling back to the default. */
export function viewFromSearch(search: string): CameraView {
  const requested = new URLSearchParams(search).get('view');
  return VIEWS[isViewId(requested) ? requested : DEFAULT_VIEW];
}
