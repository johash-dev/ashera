#!/usr/bin/env node
/**
 * PostToolUse (Edit|Write): auto-fix and lint the file Claude just changed.
 * Remaining lint errors are reported back to Claude (exit 2) so they're fixed immediately.
 */
import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';

const input = JSON.parse((await new Response(process.stdin).text()) || '{}');
const file = input?.tool_input?.file_path;
const cwd = input.cwd || process.cwd();
if (!file) process.exit(0);

const rel = relative(cwd, file).split('\\').join('/');
if (rel.startsWith('..') || rel.includes('node_modules/') || rel.startsWith('docs/reference/'))
  process.exit(0);

const run = (cmd) => spawnSync(cmd, { cwd, shell: true, encoding: 'utf8' });

if (/\.(ts|tsx|js|mjs)$/.test(rel)) {
  run(`npx prettier --write --log-level warn "${rel}"`);
  const lint = run(`npx eslint --fix --max-warnings 0 "${rel}"`);
  if (lint.error) {
    console.error(`lint-file hook could not run eslint: ${lint.error.message}`);
    process.exit(1); // non-blocking: report, don't stop Claude
  }
  if (lint.status !== 0) {
    const output = `${lint.stdout ?? ''}${lint.stderr ?? ''}`.trim();
    console.error(`ESLint problems in ${rel} (auto-fix applied where possible):\n${output}`);
    process.exit(2);
  }
} else if (/\.(md|json|css|html|ya?ml)$/.test(rel)) {
  run(`npx prettier --write --log-level warn "${rel}"`);
}
process.exit(0);
