import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { type Group, type Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { type Room, type WallId, WALLS } from '../room';
import { hiddenSurfaces } from './cutaway';
import { beamBox, type Box, wallBoxes } from './roomBoxes';
import { reportHiddenSurfaces } from './testHandle';

const WALL_COLOR = '#4a4c5c';
const FLOOR_COLOR = '#15161c';

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

/**
 * The Room's shell: floor, ceiling, four Walls with their Openings cut out, and Beams.
 * Cutaway hides the Walls and ceiling facing the camera whenever the camera moves.
 */
export function RoomShell({ room }: { room: Room }) {
  const walls = useRef<Partial<Record<WallId, Group>>>({});
  const ceiling = useRef<Mesh>(null);

  const materials = useMemo(
    () => ({
      wall: new MeshStandardMaterial({ color: WALL_COLOR }),
      floor: new MeshStandardMaterial({ color: FLOOR_COLOR }),
    }),
    [],
  );
  useEffect(
    () => () => {
      materials.wall.dispose();
      materials.floor.dispose();
    },
    [materials],
  );

  // Re-run Cutaway only when the camera has moved; NaN forces the first frame through.
  const lastCamera = useMemo(() => new Vector3(NaN, NaN, NaN), []);
  useFrame(({ camera }) => {
    if (camera.position.equals(lastCamera)) return;
    lastCamera.copy(camera.position);
    const hidden = hiddenSurfaces(room, camera.position.toArray());
    for (const wall of WALLS) {
      const group = walls.current[wall];
      if (group) group.visible = !hidden.walls.includes(wall);
    }
    if (ceiling.current) ceiling.current.visible = !hidden.ceiling;
    reportHiddenSurfaces(hidden);
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={materials.floor}>
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>
      <mesh ref={ceiling} position-y={room.ceilingHeight} rotation-x={Math.PI / 2} material={materials.wall}>
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>
      {WALLS.map((wall) => (
        <group
          key={wall}
          ref={(group) => {
            if (group) walls.current[wall] = group;
          }}
        >
          {wallBoxes(room, wall).map((box, i) => (
            <BoxMesh key={i} box={box} material={materials.wall} />
          ))}
          {room.beams.walls.includes(wall) && <BoxMesh box={beamBox(room, wall)} material={materials.wall} />}
        </group>
      ))}
    </group>
  );
}
