import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { type Item, type TvSize } from '../editor';
import { DOOR_OPEN_ANGLE_DEG, type Room, wallPieces } from '../room';
import { Items } from './Items';
import { RoomShell } from './RoomShell';
import { SlatPanel } from './SlatPanel';
import { publishSceneState, reportItems, reportView } from './testHandle';
import { AMBIENT_INTENSITY, KEY_LIGHT_INTENSITY, LOOK } from './look';
import { type CameraView } from './views';

/** True for orbit-style controls: a target to look at and an update() to apply it. */
function isOrbit(controls: object | null): controls is { target: Vector3; update: () => void } {
  return (
    controls !== null &&
    'target' in controls &&
    controls.target instanceof Vector3 &&
    'update' in controls &&
    typeof controls.update === 'function'
  );
}

/** Moves the camera and the orbit target to a View whenever the selected View changes. */
function CameraRig({ view }: { view: CameraView }) {
  const get = useThree((state) => state.get);
  // Subscribed only so the effect re-runs once OrbitControls has registered itself.
  const hasControls = useThree((state) => state.controls !== null);
  useEffect(() => {
    const { camera, controls, invalidate } = get();
    camera.position.set(...view.position);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = view.fov;
      camera.updateProjectionMatrix();
    }
    if (isOrbit(controls)) {
      controls.target.set(...view.target);
      controls.update();
    }
    invalidate(); // frames are drawn on demand
  }, [get, hasControls, view]);
  return null;
}

export function SceneCanvas({
  room,
  items,
  tvSize,
  view,
}: {
  room: Room;
  items: readonly Item[];
  tvSize: TvSize;
  view: CameraView;
}) {
  // Room facts are published once per Room; Items and the View report themselves when they change, and
  // Cutaway from the camera, so values reported once (fittings) are never reset.
  useEffect(() => {
    publishSceneState({
      ready: false,
      view: null,
      room: { width: room.width, depth: room.depth, ceilingHeight: room.ceilingHeight },
      pieces: {
        north: wallPieces(room, 'north').length,
        east: wallPieces(room, 'east').length,
        south: wallPieces(room, 'south').length,
        west: wallPieces(room, 'west').length,
      },
      beams: room.beams.walls,
      door: { openAngleDeg: DOOR_OPEN_ANGLE_DEG },
      items: [],
      tvSize: null,
      fittings: 0,
      drawCalls: 0,
      hidden: null,
    });
  }, [room]);
  useEffect(() => reportItems(items, tvSize), [room, items, tvSize]);
  useEffect(() => reportView(view.id), [view]);

  return (
    <Canvas
      frameloop="demand"
      data-testid="scene-canvas"
      camera={{ position: [...view.position], fov: view.fov, near: 0.1, far: 200 }}
      onCreated={() => {
        if (window.__ASHERA__) window.__ASHERA__.ready = true;
      }}
    >
      <color attach="background" args={[LOOK.background]} />
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={[5, 12, 8]} intensity={KEY_LIGHT_INTENSITY} />
      <RoomShell room={room} wallContents={{ north: <SlatPanel room={room} /> }} />
      <Items items={items} />
      <OrbitControls makeDefault />
      <CameraRig view={view} />
    </Canvas>
  );
}
