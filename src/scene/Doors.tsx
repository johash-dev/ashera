import { Line } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { type Room } from '../room';
import { doorSwing } from './doorSwing';
import { doorLeafBox } from './roomBoxes';

const LEAF_COLOR = '#3a3d4e';
const SWING_COLOR = '#8a8fb0';
/** Lifts the swing arc just off the floor so it does not z-fight with it. */
const ARC_LIFT = 0.01;

/** Each Door as a leaf fixed open 90° against the neighbouring Wall, with its swing arc on the floor. */
export function Doors({ room }: { room: Room }) {
  const leafMaterial = useMemo(() => new MeshStandardMaterial({ color: LEAF_COLOR }), []);
  useEffect(() => () => leafMaterial.dispose(), [leafMaterial]);

  return (
    <>
      {room.doors.map((door) => {
        const leaf = doorLeafBox(room, door);
        const arc = doorSwing(room, door).arc.map(([x, z]): [number, number, number] => [x, ARC_LIFT, z]);
        return (
          <group key={door.id}>
            <mesh position={[...leaf.position]} material={leafMaterial}>
              <boxGeometry args={[...leaf.size]} />
            </mesh>
            <Line points={arc} color={SWING_COLOR} transparent opacity={0.4} lineWidth={1} />
          </group>
        );
      })}
    </>
  );
}
