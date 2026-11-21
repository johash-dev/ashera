---
name: docs-check
description: Keep the docs trustworthy — run the integrity script, then look for contradictions, stale claims and gaps between docs and code. Use after a few features land, before a new phase, or when docs and code seem to disagree.
---

# Docs check

1. Run `npm run docs-check` and fix every problem (broken links, unindexed docs, missing front matter).
2. Read `docs/index.md`, then each doc. Compare against the code and against each other:
   - **Contradictions** between docs, or between a doc and the code (e.g. room-spec vs `room.config.ts`, architecture vs actual module imports).
   - **Stale claims**: placeholders that are now measured, phases marked future that are done, specs whose status is wrong.
   - **Gaps**: concepts used in code with no GLOSSARY entry; decisions in `docs/log.md` that deserved an ADR.
   - **Duplication**: the same fact stated in two places — keep one owner, link from the other.
3. Never silently overwrite a contradiction. If the right answer isn't clear from code, list it for the owner under "Open questions".
4. Make the fixes on a `docs/…` branch, run `npm run verify`, append a `docs` entry to `docs/log.md`, and open a PR.
