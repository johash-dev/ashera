import { type Item, type TvSize } from '../editor';
import { type WallId } from '../room';
import { type HiddenSurfaces } from './cutaway';
import type { ViewId } from './views';

/**
 * Dev-only window handle that lets Playwright assert scene state without reading pixels.
 * Never relied on by app code. Absent from production builds.
 */
export interface SceneTestState {
  ready: boolean;
  /** Selected View; null until the first View is reported. */
  view: ViewId | null;
  room: { width: number; depth: number; ceilingHeight: number };
  /** Number of solid pieces each Wall is built from (around its Openings). */
  pieces: Record<WallId, number>;
  /** Walls with a Beam. */
  beams: readonly WallId[];
  /** The Door is fixed open; angle in degrees from closed. */
  door: { openAngleDeg: number };
  /** Items drawn in the scene: type, size and centre (feet). */
  items: readonly Pick<Item, 'type' | 'size' | 'position'>[];
  /** TV size shown, in inches; null until the Items are first reported. */
  tvSize: TvSize | null;
  /** Number of Fitting plates mounted in the scene; 0 until the first frame is drawn. */
  fittings: number;
  /** WebGL draw calls in the latest frame; 0 until the first frame is drawn. */
  drawCalls: number;
  /** Current Cutaway; updated whenever the camera moves, null before the first frame. */
  hidden: HiddenSurfaces | null;
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

export function reportDrawCalls(count: number): void {
  if (import.meta.env.DEV && window.__ASHERA__) window.__ASHERA__.drawCalls = count;
}

export function reportItems(items: readonly Item[], tvSize: TvSize): void {
  if (import.meta.env.DEV && window.__ASHERA__) {
    window.__ASHERA__.items = items.map(({ type, size, position }) => ({ type, size, position }));
    window.__ASHERA__.tvSize = tvSize;
  }
}

export function reportView(view: ViewId): void {
  if (import.meta.env.DEV && window.__ASHERA__) window.__ASHERA__.view = view;
}
