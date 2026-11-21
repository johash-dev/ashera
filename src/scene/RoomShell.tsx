import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { type Group, MeshStandardMaterial, Vector3 } from 'three';
import { type Fitting, type Room, type WallId, WALLS } from '../room';
import { hiddenSurfaces } from './cutaway';
import { Doors } from './Doors';
import { fittingPlate } from './fittingPlates';
import { beamBox, type Box, skirtingBoxes, wallBoxes } from './roomBoxes';
import { reportHiddenSurfaces } from './testHandle';

const WALL_COLOR = '#4a4c5c';
const SKIRTING_COLOR = '#2a2c38';
const FLOOR_COLOR = '#15161c';
const FITTING_COLOR = '#8a8fb0';

function BoxMesh({ box, material }: { box: Box; material: MeshStandardMaterial }) {
  return (
    <mesh position={[...box.position]} material={material}>
      <boxGeometry args={[...box.size]} />
    </mesh>
  );
}

function FittingPlates({
  room,
  surface,
  material,
}: {
  room: Room;
  surface: Fitting['surface'];
  material: MeshStandardMaterial;
}) {
  return room.fittings
    .filter((fitting) => fitting.surface === surface)
    .map((fitting) => {
      const plate = fittingPlate(room, fitting);
      return (
        <mesh
          key={fitting.id}
          position={[...plate.position]}
          rotation={[...plate.rotation]}
          material={material}
        >
          <planeGeometry args={[...plate.size]} />
        </mesh>
      );
    });
}

/**
 * The Room's shell: floor, ceiling, four Walls with their Openings cut out, Beams and Fittings.
 * Cutaway hides the Walls and ceiling facing the camera, with their Fittings, whenever the camera moves.
 */
export function RoomShell({ room }: { room: Room }) {
  const walls = useRef<Partial<Record<WallId, Group>>>({});
  const ceiling = useRef<Group>(null);

  const materials = useMemo(
    () => ({
      wall: new MeshStandardMaterial({ color: WALL_COLOR }),
      skirting: new MeshStandardMaterial({ color: SKIRTING_COLOR }),
      floor: new MeshStandardMaterial({ color: FLOOR_COLOR }),
      fitting: new MeshStandardMaterial({ color: FITTING_COLOR }),
    }),
    [],
  );
  useEffect(
    () => () => {
      materials.wall.dispose();
      materials.skirting.dispose();
      materials.floor.dispose();
      materials.fitting.dispose();
    },
    [materials],
  );

  // Re-run Cutaway only when the camera has moved; NaN forces the first frame through.
  const lastCamera = useMemo(() => new Vector3(NaN, NaN, NaN), []);
  const cameraTuple = useMemo<[number, number, number]>(() => [0, 0, 0], []);
  useFrame(({ camera }) => {
    if (camera.position.equals(lastCamera)) return;
    lastCamera.copy(camera.position);
    const hidden = hiddenSurfaces(room, camera.position.toArray(cameraTuple));
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
      <group ref={ceiling}>
        <mesh position-y={room.ceilingHeight} rotation-x={Math.PI / 2} material={materials.wall}>
          <planeGeometry args={[room.width, room.depth]} />
        </mesh>
        <FittingPlates room={room} surface="ceiling" material={materials.fitting} />
      </group>
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
          {skirtingBoxes(room, wall).map((box, i) => (
            <BoxMesh key={`skirting-${i}`} box={box} material={materials.skirting} />
          ))}
          {room.beams.walls.includes(wall) && <BoxMesh box={beamBox(room, wall)} material={materials.wall} />}
          <FittingPlates room={room} surface={wall} material={materials.fitting} />
        </group>
      ))}
      <Doors room={room} />
    </group>
  );
}
