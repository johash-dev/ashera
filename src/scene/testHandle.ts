import type { ViewId } from './views';

/**
 * Dev-only window handle that lets Playwright assert scene state without reading pixels.
 * Never relied on by app code. Absent from production builds.
 */
export interface SceneTestState {
  ready: boolean;
  view: ViewId;
  room: { width: number; depth: number; ceilingHeight: number };
}

declare global {
  interface Window {
    __ASHERA__?: SceneTestState;
  }
}

export function publishSceneState(state: SceneTestState): void {
  if (import.meta.env.DEV) window.__ASHERA__ = state;
}
