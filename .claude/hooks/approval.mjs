#!/usr/bin/env node
/**
 * UserPromptSubmit hook: when the owner's own message approves the look ("looks good", "lgtm",
 * "ship it"), record the time in .claude/.state/approval.json. git-guard.mjs lets one
 * `gh pr merge --auto` through per approval. See docs/adr/0004-owner-approval-model.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const input = JSON.parse((await new Response(process.stdin).text()) || '{}');
const prompt = String(input?.prompt ?? '');
if (/\b(looks good|lgtm|ship it)\b/i.test(prompt)) {
  const dir = join(input.cwd || process.cwd(), '.claude', '.state');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'approval.json'), JSON.stringify({ at: Date.now() }));
}
process.exit(0);
