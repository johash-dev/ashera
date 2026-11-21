import { spawnSync, execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const HOOKS = join(import.meta.dirname);
const run = (hook, payload) =>
  spawnSync('node', [join(HOOKS, hook)], { input: JSON.stringify(payload), encoding: 'utf8' });

let repo;
const sh = (cmd) => execSync(cmd, { cwd: repo, stdio: 'ignore' });
const guard = (command) => run('git-guard.mjs', { cwd: repo, tool_input: { command } }).status;
const approvalFile = () => join(repo, '.claude', '.state', 'approval.json');

beforeAll(() => {
  repo = mkdtempSync(join(tmpdir(), 'ashera-hooks-'));
  sh('git init -q -b main');
  sh('git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init');
});
afterAll(() => rmSync(repo, { recursive: true, force: true }));

describe('git-guard on main', () => {
  it.each([
    ['git pull --ff-only', 0],
    ['git switch main', 0],
    ['git status', 0],
    ['npm run verify', 0],
    ['git pull', 2],
    ['git commit -m x', 2],
    ['git push -u origin feat/x', 2],
    ['git merge feat/x', 2],
    ['git switch -q feat/y && git merge --ff-only main', 0],
    ['git switch -c feat/y && git commit -m x', 0],
    ['git status && git commit -m x', 2],
    ['git switch feat/y && git switch main && git commit -m x', 2],
  ])('%s → exit %i', (command, status) => {
    expect(guard(command)).toBe(status);
  });
});

describe('git-guard on a feature branch', () => {
  beforeAll(() => sh('git switch -q -c feat/x'));

  it.each([
    ['git commit -m x', 0],
    ['git push -u origin feat/x', 0],
    ['git push --force origin feat/x', 2],
    ['git push origin main', 2],
    ['git push -u origin feat/x 2>&1 | tail -1 && gh pr create --base main --title t', 0],
    ['git push -u origin feat/x; git push origin main', 2],
    ['git reset --hard HEAD', 2],
    ['git commit --no-verify -m x', 2],
    ['gh pr merge 6 --squash --auto --admin', 2],
    ['gh pr merge 6 --squash', 2],
    ['echo {} > .claude/.state/approval.json', 2],
  ])('%s → exit %i', (command, status) => {
    expect(guard(command)).toBe(status);
  });

  it('blocks `gh pr merge --auto` until the owner approves, then allows exactly one', () => {
    const merge = 'gh pr merge 6 --squash --auto --delete-branch';
    expect(guard(merge)).toBe(2);
    expect(run('approval.mjs', { cwd: repo, prompt: 'Looks good, ship the door' }).status).toBe(0);
    expect(existsSync(approvalFile())).toBe(true);
    expect(guard(merge)).toBe(0);
    expect(guard(merge)).toBe(2);
  });

  it('rejects a stale approval', () => {
    mkdirSync(join(repo, '.claude', '.state'), { recursive: true });
    writeFileSync(approvalFile(), JSON.stringify({ at: Date.now() - 3 * 60 * 60 * 1000 }));
    expect(guard('gh pr merge 6 --squash --auto')).toBe(2);
  });
});

describe('approval hook', () => {
  it.each(['What is next?', 'approve the spec', 'it does not look good'])('ignores "%s"', (prompt) => {
    rmSync(approvalFile(), { force: true });
    run('approval.mjs', { cwd: repo, prompt });
    expect(existsSync(approvalFile())).toBe(false);
  });
});
