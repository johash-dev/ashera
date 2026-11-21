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

const branch = git('rev-parse --abbrev-ref HEAD');
const hasCommits = git('rev-parse --verify HEAD') !== null;
const onMain = hasCommits && (branch === 'main' || branch === 'master');

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
  [/\bgh\b.*\bgate-change\b/, 'only the owner adds the `gate-change` label'],
];

if (onMain) {
  rules.push(
    [/\bgit\s+commit\b/, 'never commit to main — first run `git switch -c feat/<name>` as its own command'],
    [/\bgit\s+push\b/, 'you are on main — push a feature branch instead'],
    [/\bgit\s+rebase\b/, 'rebasing main is not allowed'],
    [/\bgit\s+merge\b/, 'merges to main happen through PRs on GitHub'],
    [/\bgit\s+pull\b(?!.*--ff-only)/, 'on main use `git pull --ff-only` so no merge commit is created'],
  );
}

for (const [pattern, reason] of rules) {
  if (pattern.test(command)) block(reason);
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
