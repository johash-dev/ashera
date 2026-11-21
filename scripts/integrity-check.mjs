#!/usr/bin/env node
/**
 * Gate integrity check (docs/adr/0004-owner-approval-model.md): the agent may not weaken the
 * checks that let it work without the owner. Fails a PR that
 *   1. adds `.only` / `.skip` / `.fixme` / `xit` to a test,
 *   2. ends up with fewer test cases than its base, or
 *   3. touches a gate file (verify, this script, Playwright/Vite/ESLint/TS config, workflows,
 *      Claude hooks or settings),
 * unless the owner put the `gate-change` label on the PR.
 *
 * CI: BASE_SHA=<base commit> PR_LABELS=<comma list> node scripts/integrity-check.mjs
 * Local: node scripts/integrity-check.mjs (compares with origin/main, no labels)
 */
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const OVERRIDE_LABEL = 'gate-change';

const GATE_FILES = [
  /^scripts\/(verify\.mjs|integrity-check(\.test)?\.mjs)$/,
  /^(playwright|vite)\.config\.ts$/,
  /^eslint\.config\.js$/,
  /^tsconfig\.json$/,
  /^\.github\/workflows\//,
  /^\.claude\/hooks\//,
  /^\.claude\/settings\.json$/,
];
const TEST_FILE = /(\.test\.(ts|tsx|mjs)|\.spec\.ts)$/;
const SKIPPED = /\b(it|test|describe)\.(only|skip|fixme)\b|\b(xit|xdescribe|fit)\(/;
const TEST_CASE = /\b(it|test)(\.each)?\s*\(/g;

const isGateFile = (path) => GATE_FILES.some((re) => re.test(path));

/** Counts test declarations in one file's source. */
export const countTests = (source) => source.match(TEST_CASE)?.length ?? 0;

/**
 * @param {{ changed: string[], addedLines: { path: string, line: string }[],
 *           testsBefore: number, testsAfter: number, labels: string[] }} pr
 * @returns {string[]} violations; empty when the PR is fine or the owner allowed it
 */
export function findViolations({ changed, addedLines, testsBefore, testsAfter, labels }) {
  if (labels.includes(OVERRIDE_LABEL)) return [];
  const violations = [];
  for (const path of changed.filter(isGateFile)) {
    violations.push(`gate file changed: ${path}`);
  }
  // A gate file is already flagged as a whole (and this script's own tests quote `.only` as data).
  for (const { path, line } of addedLines) {
    if (TEST_FILE.test(path) && !isGateFile(path) && SKIPPED.test(line))
      violations.push(`test skipped or focused in ${path}: ${line.trim()}`);
  }
  if (testsAfter < testsBefore) violations.push(`test cases dropped from ${testsBefore} to ${testsAfter}`);
  return violations;
}

function readPr(base) {
  const git = (args) => execSync(`git ${args}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const changed = git(`diff --name-only ${base}...HEAD`).split('\n').filter(Boolean);
  const addedLines = [];
  let path = '';
  for (const line of git(`diff --unified=0 ${base}...HEAD`).split('\n')) {
    if (line.startsWith('+++ ')) path = line.replace(/^\+\+\+ (b\/)?/, '');
    else if (line.startsWith('+')) addedLines.push({ path, line: line.slice(1) });
  }
  const tests = (ref) =>
    git(`ls-tree -r --name-only ${ref}`)
      .split('\n')
      .filter((p) => TEST_FILE.test(p))
      .reduce((sum, p) => sum + countTests(git(`show ${ref}:${p}`)), 0);
  return { changed, addedLines, testsBefore: tests(base), testsAfter: tests('HEAD') };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const base = process.env.BASE_SHA || 'origin/main';
  const labels = (process.env.PR_LABELS ?? '')
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
  const violations = findViolations({ ...readPr(base), labels });
  if (violations.length > 0) {
    console.error(`Integrity check failed (vs ${base}):\n- ${violations.join('\n- ')}`);
    console.error(`If this is intended, the owner adds the "${OVERRIDE_LABEL}" label to the PR.`);
    process.exit(1);
  }
  console.log(`Integrity check passed (vs ${base}).`);
}
