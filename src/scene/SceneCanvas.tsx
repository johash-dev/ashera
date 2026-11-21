import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { type Room, wallPieces } from '../room';
import { hiddenSurfaces } from './cutaway';
import { RoomShell } from './RoomShell';
import { publishSceneState } from './testHandle';
import { type CameraView } from './views';

export function SceneCanvas({ room, view }: { room: Room; view: CameraView }) {
  useEffect(() => {
    publishSceneState({
      ready: false,
      view: view.id,
      room: { width: room.width, depth: room.depth, ceilingHeight: room.ceilingHeight },
      pieces: {
        north: wallPieces(room, 'north').length,
        east: wallPieces(room, 'east').length,
        south: wallPieces(room, 'south').length,
        west: wallPieces(room, 'west').length,
      },
      beams: room.beams.walls,
      hidden: hiddenSurfaces(room, view.position),
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
      <RoomShell room={room} />
      <OrbitControls target={[...view.target]} makeDefault />
    </Canvas>
  );
}
