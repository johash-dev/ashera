---
name: review
description: Independent review of the current branch against its spec and CODING_STANDARDS.md using the read-only reviewer subagent. Use before opening or merging a PR, or when the owner asks for a review.
---

# Review

The session that wrote the code doesn't grade it. Delegate to the `reviewer` subagent.

1. Make sure work is committed (the review reads `main...HEAD`).
2. Find the spec: PR description, branch name, or `docs/specs/` (status `in-progress`). If none, review against CODING_STANDARDS.md only and say so.
3. Launch the `reviewer` agent with: the branch name, the spec path, and "review `git diff main...HEAD`". Do not pass your own opinion of the code.
4. Findings are hypotheses — check each against the code; discard ones that don't hold.
5. Without asking the owner: fix every confirmed **Must fix** and **Should fix**, drop **Nits**, re-run `verify`. A finding that is a taste or design choice (not a defect) goes to the owner as a question on the Approval card. Don't loop reviews endlessly — one review + fixes per slice.
6. Report in a few lines: what was fixed, what was discarded and why.
