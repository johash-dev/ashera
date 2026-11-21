# ASHERA

Stylized dark 3D digital twin of Asher's gaming room: React + TypeScript + Vite + React Three Fiber. PC browser only. Solo project, long-lived code — keep it clean; the codebase is the example you will follow.

## Commands

- `npm run dev` — app at http://localhost:5173 (`?view=overview|top` picks a camera preset)
- `npm run verify` — **the definition of done**. Must print `ALL GREEN`. `--fast` for typecheck + lint + docs + unit only.
- `npm test`, `npm run test:e2e:local`, `npm run lint`, `npm run typecheck`, `npm run docs-check`

## Before changing anything

- Read `docs/index.md` first; it maps every doc. Domain terms are defined in `GLOSSARY.md` — use them.
- Room measurements come only from `src/room/room.config.ts`. Never hard-code a dimension elsewhere.
- `docs/reference/` is immutable source material (photos, sketches). Read it, never edit it.

## How to work

- **Think first.** State assumptions. If a request has more than one reading, ask — don't guess.
- **Simplest thing that works.** No abstractions, options or config nobody asked for.
- **Surgical changes.** Every changed line traces to the request. Mention unrelated problems; don't fix them unasked.
- **Read before write.** Check a module's `index.ts` and existing helpers before adding code.
- **Success criteria, not steps.** Turn each task into checkable outcomes and verify them.
- **Fail loud.** Every summary ends with what was _not_ verified or was skipped. Never claim done without `verify` output.
- Plans: terse, and end with a list of unresolved questions.

## Workflow

The owner designs; you do the engineering (docs/adr/0004-owner-approval-model.md). Ask the owner only for intent, the look, one-way doors, real-world facts and gate changes — never "review?", "commit?", "push?", "run the workflow?", "merge?".

Feature: `/grill` → `/spec` (owner approves) → `/ship` per slice: implement → review → fix → PR → CI → Approval card → owner says "looks good" → you merge and start the next slice. First slice = tracer bullet.
"What's next?": `/next`. Bug: `/diagnose`. Docs drift: `/docs-check`.

- Never commit to `main`; branch `feat/…`, `fix/…`, `docs/…` or `chore/…`, conventional commits, PR to `main`.
- One-way doors (saved-layout schema, device control, new dependencies, coordinate system) need an ADR in `docs/adr/` and the owner's explicit approval.
- After any feature, bug fix or decision, append an entry to `docs/log.md`.
- Visual changes: before/after screenshots of every View (`node scripts/screenshots.mjs`) go on the owner's Approval card. Baselines update only via the `update-snapshots` workflow artifact, committed by you (`docs/testing.md`).
- Never weaken a gate (tests, thresholds, `verify`, workflows, hooks, settings) without the owner: CI's integrity check fails unless the owner adds the `gate-change` label.

## Topic docs

`docs/architecture.md` (modules, boundaries) · `docs/r3f.md` (rendering rules) · `docs/testing.md` · `CODING_STANDARDS.md` · `docs/concept.md` (vision, phases)
