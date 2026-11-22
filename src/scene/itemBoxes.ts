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

/** Width of the panel edge left showing around the screen. */
const TV_EDGE = 0.04;
/** How far the screen stands proud of the panel front. */
const SCREEN_THICKNESS = 0.01;
/** Each foot's width, and how far in from the panel's ends its centre sits (share of the width). */
const TV_FOOT_WIDTH = 0.25;
const TV_FOOT_INSET = 1 / 6;

/** A TV standing on its feet: the panel, the screen on its front (south) face, and two feet below. */
export function tvBoxes(item: Item, feetHeight: number): { panel: Box; screen: Box; feet: Box[] } {
  const [x, y, z] = item.position;
  const [width, height, depth] = item.size;
  const floor = y - height / 2;
  const panelHeight = height - feetHeight;
  const panelY = floor + feetHeight + panelHeight / 2;
  const footOffset = width / 2 - width * TV_FOOT_INSET;
  return {
    panel: { position: [x, panelY, z], size: [width, panelHeight, depth] },
    screen: {
      position: [x, panelY, z + depth / 2 + SCREEN_THICKNESS / 2],
      size: [width - 2 * TV_EDGE, panelHeight - 2 * TV_EDGE, SCREEN_THICKNESS],
    },
    feet: [-footOffset, footOffset].map((dx): Box => ({
      position: [x + dx, floor + feetHeight / 2, z],
      size: [TV_FOOT_WIDTH, feetHeight, depth],
    })),
  };
}
