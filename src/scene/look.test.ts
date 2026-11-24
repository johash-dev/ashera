import { describe, expect, it } from 'vitest';
import { LOOK } from './look';

/** Perceived brightness (0-255) of a `#rrggbb` colour. */
const brightness = (hex: string) => {
  const channel = (start: number) => parseInt(hex.slice(start, start + 2), 16);
  return 0.299 * channel(1) + 0.587 * channel(3) + 0.114 * channel(5);
};

describe('LOOK', () => {
  it('holds only valid #rrggbb colours', () => {
    for (const [name, colour] of Object.entries(LOOK)) {
      expect(colour, name).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('makes the white wall lighter than the grey wall, and the grey wall lighter than the desk', () => {
    expect(brightness(LOOK.wall)).toBeGreaterThan(brightness(LOOK.wallGrey));
    expect(brightness(LOOK.wallGrey)).toBeGreaterThan(brightness(LOOK.deskTop));
  });
});
