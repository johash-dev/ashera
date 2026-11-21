---
name: next
description: Say in one line what the next step is and offer to start it. Use when the owner asks "what's next?", "where are we?", or starts a session without a task.
---

# Next

1. Read: spec statuses in `docs/specs/` (front matter and unchecked Slices / Done-when), the last 5 `docs/log.md` entries, `gh pr list --state open`, `git status`.
2. Pick the first that applies:
   - An open PR waiting for the owner → show its Approval card again (`/ship` step 5).
   - An open PR with red CI or unaddressed review → "Fixing PR #n" and do it.
   - An `approved`/`in-progress` spec with an unchecked slice → "Next: slice N of <spec> — <one-line what you'll see>."
   - A spec `draft` → "The <spec> spec needs your approval" plus its 5-line summary.
   - Nothing open → the next phase from `docs/concept.md`, as a `/grill` topic.
3. Reply in one or two lines and offer to start (button "Start"). On yes, run `/ship` (or `/grill`). Don't list everything you read.
