import { describe, expect, it } from 'vitest';
import { mergeBoxes } from './mergedBoxes';

describe('mergeBoxes', () => {
  it('joins the boxes into one geometry, 24 vertices each', () => {
    const geometry = mergeBoxes([
      { position: [0, 0, 0], size: [1, 1, 1] },
      { position: [5, 0, 0], size: [1, 1, 1] },
      { position: [0, 3, 0], size: [2, 1, 1] },
    ]);
    expect(geometry.getAttribute('position').count).toBe(72);
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
