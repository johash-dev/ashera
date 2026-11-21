import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASHERS_ROOM } from './room.config';

/**
 * Cross-checks room.config.ts against the measurements as written in docs/room-spec.md
 * ("Measured values" table), so a value and its test can't agree on a wrong conversion.
 */

const spec = readFileSync(join(import.meta.dirname, '../../docs/room-spec.md'), 'utf8');
const table = spec.split('<!-- measurements:start -->')[1]?.split('<!-- measurements:end -->')[0] ?? '';
const rows = [...table.matchAll(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|$/gm)].map(
  ([, path = '', measured = '']) => ({
    path,
    measured,
  }),
);

/** "7′ 2″" → 7.1667 ft, "6″" → 0.5 ft, "10′" → 10 ft. */
function toFeet(measured: string): number {
  const match = /^(?:(\d+)′)?\s*(?:(\d+)″)?$/.exec(measured);
  if (!match || (match[1] === undefined && match[2] === undefined))
    throw new Error(`can't read "${measured}"`);
  return Number(match[1] ?? 0) + Number(match[2] ?? 0) / 12;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Follows a dotted config path; inside a list, a segment picks the entry with that `id`. */
function lookup(path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (Array.isArray(node)) return node.find((entry) => isRecord(entry) && entry['id'] === key);
    return isRecord(node) ? node[key] : undefined;
  }, ASHERS_ROOM);
}

describe('toFeet', () => {
  it.each([
    ['10′', 10],
    ['9′ 6″', 9.5],
    ['6″', 0.5],
    ['7′ 2″', 86 / 12],
  ])('%s → %f ft', (measured, feet) => {
    expect(toFeet(measured)).toBeCloseTo(feet, 6);
  });

  it('rejects anything it cannot read', () => {
    expect(() => toFeet('about 7 ft')).toThrow();
  });
});

describe('room.config.ts matches docs/room-spec.md', () => {
  it('has a measurements table', () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it.each(rows)('$path = $measured', ({ path, measured }) => {
    expect(lookup(path)).toBeCloseTo(toFeet(measured), 6);
  });
});
