import { type Item } from '../editor';
import { type Box } from './roomBoxes';

/** Gap around and between the stand's doors, so they read as separate doors. */
const DOOR_GAP = 0.03;
/** How far each door stands proud of the stand's front face. */
const DOOR_THICKNESS = 0.02;

/** A stand's body, and its doors as thin panels side by side on its front (south) face. */
export function standBoxes(item: Item, doorCount: number): { body: Box; doors: Box[] } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  const doorWidth = (width - DOOR_GAP * (doorCount + 1)) / doorCount;
  const doorZ = z + depth / 2 + DOOR_THICKNESS / 2;
  const doors = Array.from({ length: doorCount }, (_, i): Box => ({
    position: [x - width / 2 + DOOR_GAP + doorWidth / 2 + i * (doorWidth + DOOR_GAP), y, doorZ],
    size: [doorWidth, height - 2 * DOOR_GAP, DOOR_THICKNESS],
  }));
  return { body: { position: item.position, size: item.size }, doors };
}
