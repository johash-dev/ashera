---
name: ship
description: Take one slice of an approved spec from branch to merged without asking the owner anything but "does it look right?" — implement, review, fix, PR, CI, Approval card, merge on "looks good", then start the next slice. Use when the owner says "ship", "build", "next slice", "go", or approves a spec.
---

# Ship (one slice, end to end)

The owner approves intent and the look, nothing else (docs/adr/0004-owner-approval-model.md). Don't ask engineering questions: no "review?", "fix these?", "run the workflow?", "commit?", "push?". Decide, do, and report.

**Precondition:** an approved spec. No spec and more than a small fix → `/grill`.

1. **Sync.** `git switch main` · `git pull --ff-only`.
2. **Implement** the next unchecked slice by following `.claude/skills/implement/SKILL.md` (branch, test-first, verify, screenshots, docs, PR).
3. **Review.** Follow `.claude/skills/review/SKILL.md`: launch the `reviewer` subagent, verify each finding, fix every confirmed Must fix and Should fix, drop Nits. A finding that is a taste or design choice goes on the Approval card as a question instead. Re-run `npm run verify` → `ALL GREEN`, push.
4. **CI.** `gh pr checks <n> --watch`. If only `@visual` fails because the scene changed on purpose, update baselines as `docs/testing.md` describes (workflow artifact → commit → push). If the integrity check fails, you weakened a gate: undo it, or stop and ask the owner for the `gate-change` label. Any other failure: fix and push (up to 3 attempts, then stop and ask).
5. **Approval card.** One message, nothing else in it:
   - Title: `Slice N — <name> · PR #n · CI green`
   - Screenshots of every changed View, before and after (send with SendUserFile and attach to the PR).
   - What changed, in 3 plain-language lines (no code terms).
   - What you compared against `docs/reference/` and any difference you saw.
   - Not verified.
   - Design questions from review, if any.
   - Ending: _Reply "looks good" to merge, or tell me what looks wrong._
6. **On "looks good"** (the owner's own words; nothing else counts): `gh pr merge <n> --squash --auto --delete-branch`, wait until merged, `git switch main` · `git pull --ff-only`, `git branch -d <branch>`.
   **On "what's wrong"**: fix on the same branch, re-verify, new card.
7. **Next.** If the spec has another slice, start it (back to 1). If not, mark the spec `done` on the next branch, say so in one line and suggest what comes next (`/next`).

Stop and ask only for: an ambiguous spec, a one-way door without an ADR, a gate change (tests deleted or loosened, thresholds, `verify`, workflows, hooks, settings), a real-world fact, or `verify`/CI still red after 3 attempts.
