import { Edges } from '@react-three/drei';
import { type Room } from '../room';

/**
 * Harness placeholder: the room's floor slab and a wireframe of its volume, sized from the
 * room config. Replaced by the real room geometry in Phase 1.
 */
export function PlaceholderRoom({ room }: { room: Room }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial color="#15161c" />
      </mesh>
      <mesh position-y={room.ceilingHeight / 2}>
        <boxGeometry args={[room.width, room.ceilingHeight, room.depth]} />
        <meshBasicMaterial visible={false} />
        <Edges color="#7c5cff" />
      </mesh>
    </group>
  );
}
