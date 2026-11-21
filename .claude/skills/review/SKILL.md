---
name: review
description: Independent review of the current branch against its spec and CODING_STANDARDS.md using the read-only reviewer subagent. Use before opening or merging a PR, or when the owner asks for a review.
---

# Review

The session that wrote the code doesn't grade it. Delegate to the `reviewer` subagent.

1. Make sure work is committed (the review reads `main...HEAD`).
2. Find the spec: PR description, branch name, or `docs/specs/` (status `in-progress`). If none, review against CODING_STANDARDS.md only and say so.
3. Launch the `reviewer` agent with: the branch name, the spec path, and "review `git diff main...HEAD`". Do not pass your own opinion of the code.
4. Relay its findings to the owner grouped as **Must fix / Should fix / Nit**, each with its citation. Findings are hypotheses — check each against the code before acting; discard ones that don't hold and say why.
5. Fix confirmed Must-fix items (re-run `verify`), then stop. Don't loop reviews endlessly — one review + fixes per slice.
