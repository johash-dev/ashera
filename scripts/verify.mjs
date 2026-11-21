#!/usr/bin/env node
/**
 * The definition of done. Runs every check in order and stops at the first failure.
 * Prints "ALL GREEN" only when everything passes.
 *
 *   npm run verify            local: skips @visual screenshot comparisons (baselines are Linux/CI)
 *   npm run verify -- --ci    CI: runs everything including @visual
 *   npm run verify -- --fast  typecheck + lint + unit tests only (no build, no e2e)
 */
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const ci = args.has('--ci') || !!process.env.CI;
const fast = args.has('--fast');

const steps = [
  ['typecheck', 'npm run typecheck'],
  ['lint', 'npm run lint'],
  ['docs-check', 'npm run docs-check'],
  ['unit tests', 'npm test'],
];
if (!fast) {
  steps.push(['build', 'npm run build']);
  steps.push(['e2e', ci ? 'npm run test:e2e' : 'npm run test:e2e:local']);
}

const results = [];
for (const [name, command] of steps) {
  console.log(`\n▶ ${name}: ${command}`);
  const started = Date.now();
  const { status } = spawnSync(command, { stdio: 'inherit', shell: true });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  results.push(`${status === 0 ? '✔' : '✘'} ${name} (${seconds}s)`);
  if (status !== 0) {
    console.log(`\n${results.join('\n')}\n\nVERIFY FAILED at: ${name}`);
    process.exit(1);
  }
}

console.log(`\n${results.join('\n')}`);
if (!ci && !fast) console.log('(visual snapshot comparisons skipped locally — they run in CI)');
console.log('\nALL GREEN');
