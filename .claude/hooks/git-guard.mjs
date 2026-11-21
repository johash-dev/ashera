#!/usr/bin/env node
/**
 * PreToolUse guard for Bash/PowerShell: blocks destructive or workflow-breaking git/gh commands.
 * Exit 2 = block; the stderr message is shown to Claude so it can choose a safer route.
 * The owner can still run anything in their own terminal.
 *
 * Merging (docs/adr/0004-owner-approval-model.md): `gh pr merge` needs `--auto` (GitHub then waits
 * for the required checks), never `--admin`, and a fresh owner approval recorded by approval.mjs
 * when the owner types "looks good". The approval is used up by the merge.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const APPROVAL_MAX_AGE_MS = 2 * 60 * 60 * 1000;

const input = JSON.parse((await new Response(process.stdin).text()) || '{}');
const command = String(input?.tool_input?.command ?? '');
const cwd = input.cwd || process.cwd();
if (/approval\.json/.test(command)) block('only the owner\'s "looks good" may record an approval');
if (!/\b(git|gh)\b/.test(command)) process.exit(0);

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function block(reason) {
  console.error(
    `BLOCKED by .claude/hooks/git-guard.mjs: ${reason}.\nCommand: ${command}\nIf the owner explicitly wants this, ask them to run it themselves.`,
  );
  process.exit(2);
}

const hasCommits = git('rev-parse --verify HEAD') !== null;

const rules = [
  [/\bgit\s+push\b.*(\s--force\b|\s-f\b|\s--force-with-lease\b|\s\+\S)/, 'force push is not allowed'],
  [
    /\bgit\s+push\b.*\b(main|master)\b/,
    'pushing to main is not allowed — push a feature branch and open a PR',
  ],
  [/\bgit\s+reset\b.*--hard\b/, '`git reset --hard` discards work'],
  [/\bgit\s+clean\b.*\s-\w*f/, '`git clean -f` deletes untracked files'],
  [/\bgit\s+branch\b.*\s-D\b/, '`git branch -D` deletes unmerged work — use -d after the PR is merged'],
  [/\bgit\s+checkout\b.*\s(--\s+)?\.(\s|$)/, '`git checkout .` discards working-tree changes'],
  [/\bgit\s+restore\b.*\s\.(\s|$)/, '`git restore .` discards working-tree changes'],
  [/--no-verify\b/, 'bypassing hooks with --no-verify is not allowed — fix the failing check'],
  [/\bgit\s+(filter-branch|filter-repo)\b/, 'history rewriting is not allowed'],
  [/\bgh\s+pr\s+merge\b.*--admin\b/, '`--admin` bypasses branch protection'],
];

const mainRules = [
  [/\bgit\s+commit\b/, 'never commit to main — first run `git switch -c feat/<name>`'],
  [/\bgit\s+push\b/, 'you are on main — push a feature branch instead'],
  [/\bgit\s+rebase\b/, 'rebasing main is not allowed'],
  [/\bgit\s+merge\b/, 'merges to main happen through PRs on GitHub'],
  [/\bgit\s+pull\b(?!.*--ff-only)/, 'on main use `git pull --ff-only` so no merge commit is created'],
];

// Judge each part of a chained command on its own, on the branch it will actually run on:
// `git switch feat/x && git merge main` merges into feat/x, and `--base main` in a later
// `gh pr create` is not a push to main.
let branch = git('rev-parse --abbrev-ref HEAD');
for (const segment of command.split(/&&|\|\||;|\||\n/)) {
  const onMain = hasCommits && (branch === 'main' || branch === 'master');
  for (const [pattern, reason] of onMain ? [...rules, ...mainRules] : rules) {
    if (pattern.test(segment)) block(reason);
  }
  const switched = /\bgit\s+(?:switch|checkout)\b((?:\s+\S+)+)/.exec(segment);
  const target = switched?.[1]
    ?.trim()
    .split(/\s+/)
    .filter((arg) => !arg.startsWith('-'))
    .at(-1);
  if (target && !switched[1].includes(' -- ')) branch = target;
}

if (/\bgh\s+pr\s+merge\b/.test(command)) {
  if (!/\s--auto\b/.test(command)) block('merge with `--auto` so GitHub waits for the required checks');
  const approvalFile = join(cwd, '.claude', '.state', 'approval.json');
  const approvedAt = existsSync(approvalFile) ? Number(JSON.parse(readFileSync(approvalFile, 'utf8')).at) : 0;
  if (!(Date.now() - approvedAt < APPROVAL_MAX_AGE_MS)) {
    block('no fresh owner approval — show the Approval card and wait for the owner to reply "looks good"');
  }
  rmSync(approvalFile);
}
process.exit(0);
