#!/usr/bin/env node
/**
 * Stop hook: before Claude ends a turn, run fast checks on uncommitted changes.
 * Script/code files changed → eslint on them. Code changed → typecheck + unit tests.
 * Docs changed → docs-check.
 * On failure exit 2 so Claude keeps working and fixes it. Runs at most once per stop
 * (stop_hook_active) so it can never loop forever.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const input = JSON.parse((await new Response(process.stdin).text()) || '{}');
if (input.stop_hook_active) process.exit(0);
const cwd = input.cwd || process.cwd();

const run = (cmd) => spawnSync(cmd, { cwd, shell: true, encoding: 'utf8' });
const status = run('git status --porcelain');
if (status.status !== 0) process.exit(0);

const changed = status.stdout
  .split('\n')
  .filter(Boolean)
  .map((line) => line.slice(3).replace(/^"|"$/g, ''));
const codeChanged = changed.some((p) => /^(src|e2e)\/|\.config\.ts$|^tsconfig/.test(p));
const docsChanged = changed.some((p) => p.endsWith('.md') || p.startsWith('docs/'));

const lintable = changed.filter(
  (p) => /\.(ts|tsx|js|mjs)$/.test(p) && !p.startsWith('.scratch/') && existsSync(join(cwd, p)),
);

const checks = [];
if (lintable.length > 0)
  checks.push(`npx eslint --max-warnings 0 ${lintable.map((p) => `"${p}"`).join(' ')}`);
if (codeChanged) checks.push('npm run typecheck', 'npm test');
if (docsChanged) checks.push('npm run docs-check');

for (const cmd of checks) {
  const result = run(cmd);
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.message ?? ''}`
      .trim()
      .split('\n')
      .slice(-40)
      .join('\n');
    console.error(
      `Stop check failed: \`${cmd}\` — fix this before finishing (or explain why in your summary).\n${output}`,
    );
    process.exit(2);
  }
}
process.exit(0);
