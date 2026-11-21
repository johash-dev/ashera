---
status: accepted
date: 2026-11-22
---

# 0004 — The owner approves intent and the look; the agent does the engineering

## Context

The owner wants to design, not run an engineering process. A retro of the first 9 sessions found the owner pulled in for every merge, snapshot-workflow run, CI re-run, review-fix decision and "what's next?" hand-off. Research (Karpathy, Pocock, Huntley, Anthropic's Claude Code guidance) agrees: the human belongs at intent and at outcome; everything between is a loop gated by machine checks the agent can't weaken.

## Decision

The owner is asked for exactly these things:

1. **Intent** — answers in `/grill`, approval of the `/spec` summary.
2. **The look** — per slice, an Approval card in chat (before/after screenshots of every changed View, what changed, what was not verified). The owner replies "looks good" or says what's wrong.
3. **One-way doors** — ADRs for saved-layout schema, device control, new dependencies, coordinate system.
4. **Real-world facts** only the owner knows (measurements, photos).
5. **Gate changes** — edits that loosen a check (tests, thresholds, `verify`, workflows, hooks, settings).

Everything else is the agent's job without asking: branching, test-first coding, `verify`, review by the `reviewer` subagent and fixing its findings, PRs, CI, baselines, merging, syncing `main`, logging, and starting the next slice.

Merging is enforced, not just written down:

- `.claude/hooks/approval.mjs` records an approval when the owner's own message says "looks good", "lgtm" or "ship it".
- `.claude/hooks/git-guard.mjs` allows `gh pr merge` only with `--auto` (GitHub waits for the required `verify` check), never with `--admin`, and only with a fresh (under 2 h) approval, which the merge uses up.

## Consequences

- One owner reply per slice in the normal case; no GitHub clicks.
- Code quality rests on `verify`, the reviewer subagent and the guards, not on the owner reading diffs. Weakening any of those needs the owner.
- "Looks good" anywhere in an owner message counts as approval for the PR currently on the card; the agent shows one card at a time.
