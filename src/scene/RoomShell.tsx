import { addAfterEffect, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { type Group, MeshStandardMaterial, Vector3 } from 'three';
import { type Fitting, floorTileLines, type Room, type WallId, WALLS } from '../room';
import { hiddenSurfaces } from './cutaway';
import { Doors } from './Doors';
import { fittingPlate } from './fittingPlates';
import {
  CEILING_LIGHT_GLOW,
  CEILING_LIGHT_INTENSITY,
  CEILING_LIGHT_RANGE,
  LOOK,
  TILE_LINE_OPACITY,
} from './look';
import { beamBox, type Box, skirtingBoxes, wallBoxes, windowBoxes } from './roomBoxes';
import { reportDrawCalls, reportFittingsDrawn, reportHiddenSurfaces } from './testHandle';

/** Lifts the floor-tile joints just off the floor so they do not z-fight with it. */
const TILE_LINE_LIFT = 0.01;
/** The cast light sits this far below the Beam undersides, so it lights them as well. */
const LIGHT_BELOW_BEAMS = 1;
/** Object name of every Fitting plate, so the test handle can count what is drawn. */
const FITTING_PLATE = 'fitting-plate';

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
  materials,
}: {
  room: Room;
  surface: Fitting['surface'];
  materials: { fitting: MeshStandardMaterial; light: MeshStandardMaterial };
}) {
  return room.fittings
    .filter((fitting) => fitting.surface === surface)
    .map((fitting) => {
      const plate = fittingPlate(room, fitting);
      return (
        <mesh
          key={fitting.id}
          name={FITTING_PLATE}
          position={[...plate.position]}
          rotation={[...plate.rotation]}
          material={fitting.kind === 'ceiling-light' ? materials.light : materials.fitting}
        >
          <planeGeometry args={[...plate.size]} />
        </mesh>
      );
    });
}

/** The floor-tile joints as one set of line segments (a single draw call). */
function FloorTileLines({ room }: { room: Room }) {
  const positions = useMemo(
    () =>
      new Float32Array(
        floorTileLines(room).flatMap(({ from, to }) => [
          from[0],
          TILE_LINE_LIFT,
          from[1],
          to[0],
          TILE_LINE_LIFT,
          to[1],
        ]),
      ),
    [room],
  );
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={LOOK.accent} transparent opacity={TILE_LINE_OPACITY} />
    </lineSegments>
  );
}

/**
 * The Room's shell: floor, ceiling, four Walls with their Openings cut out, Beams and Fittings.
 * Cutaway hides the Walls and ceiling facing the camera, with their Fittings, whenever the camera moves.
 */
export function RoomShell({ room }: { room: Room }) {
  const root = useRef<Group>(null);
  const walls = useRef<Partial<Record<WallId, Group>>>({});
  const ceiling = useRef<Group>(null);

  const materials = useMemo(
    () => ({
      wall: new MeshStandardMaterial({ color: LOOK.wall }),
      skirting: new MeshStandardMaterial({ color: LOOK.skirting }),
      floor: new MeshStandardMaterial({ color: LOOK.floor, roughness: 0.6 }),
      fitting: new MeshStandardMaterial({ color: LOOK.fitting }),
      light: new MeshStandardMaterial({
        color: LOOK.ceilingLight,
        emissive: LOOK.ceilingLight,
        emissiveIntensity: CEILING_LIGHT_GLOW,
      }),
      windowFrame: new MeshStandardMaterial({ color: LOOK.windowFrame }),
      windowGlass: new MeshStandardMaterial({ color: LOOK.windowGlass, roughness: 0.7 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      materials.wall.dispose();
      materials.skirting.dispose();
      materials.floor.dispose();
      materials.fitting.dispose();
      materials.light.dispose();
      materials.windowFrame.dispose();
      materials.windowGlass.dispose();
    },
    [materials],
  );

  // Draw calls are counted after each frame is rendered (frames are drawn on demand only).
  const gl = useThree((state) => state.gl);
  useEffect(() => addAfterEffect(() => reportDrawCalls(gl.info.render.calls)), [gl]);

  // Re-run Cutaway only when the camera has moved; NaN forces the first frame through.
  const lastCamera = useMemo(() => new Vector3(NaN, NaN, NaN), []);
  const cameraTuple = useMemo<[number, number, number]>(() => [0, 0, 0], []);
  useFrame(({ camera }) => {
    if (camera.position.equals(lastCamera)) return;
    if (Number.isNaN(lastCamera.x) && root.current) {
      reportFittingsDrawn(root.current.getObjectsByProperty('name', FITTING_PLATE).length);
    }
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
    <group ref={root}>
      <mesh rotation-x={-Math.PI / 2} material={materials.floor}>
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>
      <FloorTileLines room={room} />
      {room.fittings
        .filter((fitting) => fitting.kind === 'ceiling-light')
        .map((fitting) => {
          const [x, , z] = fittingPlate(room, fitting).position;
          return (
            <pointLight
              key={fitting.id}
              position={[x, room.ceilingHeight - room.beams.drop - LIGHT_BELOW_BEAMS, z]}
              color={LOOK.ceilingLight}
              intensity={CEILING_LIGHT_INTENSITY}
              distance={CEILING_LIGHT_RANGE}
            />
          );
        })}
      <group ref={ceiling}>
        <mesh position-y={room.ceilingHeight} rotation-x={Math.PI / 2} material={materials.wall}>
          <planeGeometry args={[room.width, room.depth]} />
        </mesh>
        <FittingPlates room={room} surface="ceiling" materials={materials} />
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
          {room.openings
            .filter((opening) => opening.wall === wall && opening.kind === 'window')
            .map((opening) => {
              const { frame, glass } = windowBoxes(room, opening);
              return (
                <group key={opening.id}>
                  {frame.map((box, i) => (
                    <BoxMesh key={i} box={box} material={materials.windowFrame} />
                  ))}
                  <BoxMesh box={glass} material={materials.windowGlass} />
                </group>
              );
            })}
          <FittingPlates room={room} surface={wall} materials={materials} />
        </group>
      ))}
      <Doors room={room} />
    </group>
  );
}
