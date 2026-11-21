import { type WallId } from '../room';
import { type HiddenSurfaces } from './cutaway';
import type { ViewId } from './views';

/**
 * Dev-only window handle that lets Playwright assert scene state without reading pixels.
 * Never relied on by app code. Absent from production builds.
 */
export interface SceneTestState {
  ready: boolean;
  view: ViewId;
  room: { width: number; depth: number; ceilingHeight: number };
  /** Number of solid pieces each Wall is built from (around its Openings). */
  pieces: Record<WallId, number>;
  /** Walls with a Beam. */
  beams: readonly WallId[];
  /** The Door is fixed open; angle in degrees from closed. */
  door: { openAngleDeg: number };
  /** Number of Fitting plates mounted in the scene; 0 until the first frame is drawn. */
  fittings: number;
  /** Current Cutaway; updated whenever the camera moves. */
  hidden: HiddenSurfaces;
}

declare global {
  interface Window {
    __ASHERA__?: SceneTestState;
  }
}

export function publishSceneState(state: SceneTestState): void {
  if (import.meta.env.DEV) window.__ASHERA__ = state;
}

export function reportFittingsDrawn(count: number): void {
  if (import.meta.env.DEV && window.__ASHERA__) window.__ASHERA__.fittings = count;
}

export function reportHiddenSurfaces(hidden: HiddenSurfaces): void {
  if (import.meta.env.DEV && window.__ASHERA__) window.__ASHERA__.hidden = hidden;
}
