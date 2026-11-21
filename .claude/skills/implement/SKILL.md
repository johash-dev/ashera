---
name: implement
description: Implement one slice of an approved spec end-to-end — branch, test-first, verify, screenshots, docs, PR. Use when the owner says "implement", "build slice N", "do the next slice", or approves a spec.
---

# Implement (one slice)

**Precondition:** an approved spec in `docs/specs/`. No spec and the change is more than a small fix → stop and suggest `/grill` or `/spec`.

1. **Load context.** Read the spec, `docs/index.md`, the last 5 entries of `docs/log.md`, `CODING_STANDARDS.md`, and the `index.ts` of every module you'll touch. Read `docs/r3f.md` if touching `src/scene`.
2. **Branch.** From an up-to-date `main`: `git switch -c feat/<spec>-<slice>` (or `fix/…`). Set spec `status: in-progress`.
3. **State the slice's success criteria** (from the spec's Done-when) before coding.
4. **Test first for pure logic** — one failing test → minimal code to pass → refactor → next test. Never write all tests up front, never weaken a test to make it pass.
5. **Build the rest of the slice** (scene/ui). Keep components thin; rules live in pure modules. Extend `window.__ASHERA__` and e2e tests when behaviour is observable in the app.
6. **Verify.** `npm run verify` must print `ALL GREEN`. Fix causes, not symptoms. Don't bypass hooks.
7. **See it.** Start the dev server (browser pane / preview) and look at every affected View (`?view=…`). Save screenshots as PR evidence. If it looks wrong, it is wrong — even with green tests.
8. **Docs.** Update docs the change affects (room-spec, architecture, glossary…), tick the spec's Done-when boxes, append a `docs/log.md` entry. `npm run docs-check` green.
9. **Commit** in logical conventional commits, push the branch, open a PR using `.github/pull_request_template.md` — include screenshots and the honest "Not verified" section. Suggest `/review` in a fresh session.

Stop and ask the owner when: the spec is ambiguous, the slice needs a one-way-door change without an ADR, or `verify` can't be made green within ~3 attempts. Never merge — the owner merges.
