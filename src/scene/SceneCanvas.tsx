import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { type Room } from '../room';
import { PlaceholderRoom } from './PlaceholderRoom';
import { publishSceneState } from './testHandle';
import { type CameraView } from './views';

export function SceneCanvas({ room, view }: { room: Room; view: CameraView }) {
  useEffect(() => {
    publishSceneState({
      ready: false,
      view: view.id,
      room: { width: room.width, depth: room.depth, ceilingHeight: room.ceilingHeight },
    });
  }, [room, view]);

  return (
    <Canvas
      data-testid="scene-canvas"
      camera={{ position: [...view.position], fov: view.fov, near: 0.1, far: 200 }}
      onCreated={() => {
        if (window.__ASHERA__) window.__ASHERA__.ready = true;
      }}
    >
      <color attach="background" args={['#0b0b10']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 12, 8]} intensity={1.2} />
      <PlaceholderRoom room={room} />
      <OrbitControls target={[...view.target]} makeDefault />
    </Canvas>
  );
}
