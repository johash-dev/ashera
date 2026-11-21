#!/usr/bin/env node
/**
 * PreToolUse guard for Bash/PowerShell: blocks destructive or workflow-breaking git commands.
 * Exit 2 = block; the stderr message is shown to Claude so it can choose a safer route.
 * The owner can still run anything in their own terminal.
 */
import { execSync } from 'node:child_process';

const input = JSON.parse((await new Response(process.stdin).text()) || '{}');
const command = String(input?.tool_input?.command ?? '');
if (!/\bgit\b/.test(command)) process.exit(0);

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: input.cwd || process.cwd(), stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
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
];

if (onMain) {
  rules.push(
    [/\bgit\s+commit\b/, 'never commit to main — first run `git switch -c feat/<name>` as its own command'],
    [/\bgit\s+push\b/, 'you are on main — push a feature branch instead'],
    [/\bgit\s+rebase\b/, 'rebasing main is not allowed'],
    [/\bgit\s+merge\b/, 'merges to main happen through PRs on GitHub'],
  );
}

for (const [pattern, reason] of rules) {
  if (pattern.test(command)) {
    console.error(
      `BLOCKED by .claude/hooks/git-guard.mjs: ${reason}.\nCommand: ${command}\nIf the owner explicitly wants this, ask them to run it themselves.`,
    );
    process.exit(2);
  }
}
process.exit(0);
