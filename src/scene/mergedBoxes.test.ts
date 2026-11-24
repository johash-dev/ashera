import { describe, expect, it } from 'vitest';
import { mergeBoxes } from './mergedBoxes';

describe('mergeBoxes', () => {
  it('joins sharp boxes into one geometry, 24 vertices each', () => {
    const geometry = mergeBoxes([
      { position: [0, 0, 0], size: [1, 1, 1], radius: 0 },
      { position: [5, 0, 0], size: [1, 1, 1], radius: 0 },
      { position: [0, 3, 0], size: [2, 1, 1], radius: 0 },
    ]);
    expect(geometry.getAttribute('position').count).toBe(72);
  });

  it('rounds the edges by default: more vertices than a sharp box, but no vertex at a corner', () => {
    const geometry = mergeBoxes([{ position: [0, 0, 0], size: [2, 2, 2] }]);
    const position = geometry.getAttribute('position');
    expect(position.count).toBeGreaterThan(24);
    for (let i = 0; i < position.count; i++) {
      const atCorner = [position.getX(i), position.getY(i), position.getZ(i)].every(
        (c) => Math.abs(c) > 0.999,
      );
      expect(atCorner).toBe(false);
    }
  });

  it('rounds without changing the size: the bounds are the box itself', () => {
    const geometry = mergeBoxes([{ position: [3, 1, -2], size: [4, 2, 0.5] }]);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.min.toArray().map((c) => Number(c.toFixed(4)))).toEqual([1, 0, -2.25]);
    expect(geometry.boundingBox?.max.toArray().map((c) => Number(c.toFixed(4)))).toEqual([5, 2, -1.75]);
  });

  it('never rounds a thin box more than a quarter of its thinnest side, so a wall stays a wall', () => {
    const geometry = mergeBoxes([{ position: [0, 0, 0], size: [10, 10, 0.1], radius: 5 }]);
    const position = geometry.getAttribute('position');
    const frontFaceXs = Array.from({ length: position.count }, (_, i) => i)
      .filter((i) => position.getZ(i) > 0.049)
      .map((i) => Math.abs(position.getX(i)));
    expect(Math.max(...frontFaceXs)).toBeGreaterThan(4.9);
  });

  it('keeps each box where it is, so the merged bounds enclose them all', () => {
    const geometry = mergeBoxes([
      { position: [0, 0, 0], size: [2, 2, 2] },
      { position: [10, 4, -6], size: [2, 2, 2] },
    ]);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.min.toArray()).toEqual([-1, -1, -7]);
    expect(geometry.boundingBox?.max.toArray()).toEqual([11, 5, 1]);
  });

  it('turns a yawed box about its centre: a positive angle points its x axis towards -z', () => {
    const geometry = mergeBoxes([{ position: [0, 0, 0], size: [4, 1, 1], yawRad: Math.PI / 2 }]);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) throw new Error('expected bounds');
    expect(box.max.x - box.min.x).toBeCloseTo(1);
    expect(box.max.z - box.min.z).toBeCloseTo(4);
  });

  it('refuses an empty list rather than drawing nothing silently', () => {
    expect(() => mergeBoxes([])).toThrow();
  });
});
