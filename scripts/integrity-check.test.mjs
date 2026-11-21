import { describe, expect, it } from 'vitest';
import { countTests, findViolations } from './integrity-check.mjs';

const clean = {
  changed: ['src/room/room.config.ts'],
  addedLines: [],
  testsBefore: 10,
  testsAfter: 10,
  labels: [],
};

describe('findViolations', () => {
  it('passes an ordinary change', () => {
    expect(findViolations(clean)).toEqual([]);
  });

  it.each([
    ['a focused test', { addedLines: [{ path: 'src/a.test.ts', line: "  it.only('x', () => {" }] }],
    [
      'a skipped e2e test',
      { addedLines: [{ path: 'e2e/app.spec.ts', line: "test.skip('x', async () => {" }] },
    ],
    ['a dropped test', { testsAfter: 9 }],
    ['a loosened threshold', { changed: ['playwright.config.ts'] }],
    ['an edited verify script', { changed: ['scripts/verify.mjs'] }],
    ['an edited workflow', { changed: ['.github/workflows/ci.yml'] }],
    ['an edited hook', { changed: ['.claude/hooks/git-guard.mjs'] }],
  ])('fails %s', (_name, change) => {
    const pr = { ...clean, ...change };
    expect(findViolations(pr)).toHaveLength(1);
    expect(findViolations({ ...pr, labels: ['gate-change'] })).toEqual([]);
  });

  it('ignores `.skip` outside test files', () => {
    expect(findViolations({ ...clean, addedLines: [{ path: 'src/a.ts', line: 'list.skip(1)' }] })).toEqual(
      [],
    );
  });
});

describe('countTests', () => {
  it('counts it, test and it.each declarations', () => {
    expect(countTests("it('a', f); test('b', f); it.each([1])('c', f); describe('d', f);")).toBe(3);
  });
});
