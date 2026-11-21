# Work log

Append-only, newest at the bottom. One entry per feature, bug fix, decision or refactor.
Format: `## [YYYY-MM-DD] feature|bug|decision|refactor|docs | title`, then 1–4 bullets (what, why, links).
Recent entries: `grep "^## \[" docs/log.md | tail -5`

## [2026-11-21] decision | Concept agreed

- One room, one user (Asher), PC only; stylized dark look; Asher moves furniture himself.
- Phases: empty-room twin → furniture editor → look & lighting → smart devices (later). See docs/concept.md.

## [2026-11-21] docs | Room measured

- 9 × 10 ft, 9.5 ft ceiling, beams on north/west/south walls dropping 0.5 ft. Doorway, window and beam depth are placeholders. See docs/room-spec.md.

## [2026-11-21] feature | Workflow harness bootstrapped

- Vite + React + R3F skeleton with module boundaries; room config + `validateRoom` with tests.
- `npm run verify`, husky pre-commit, Playwright e2e + Linux visual baselines in CI.
- CLAUDE.md, glossary, standards, ADRs 0001–0003, Claude Code hooks/skills/reviewer agent.

## [2026-11-21] bug | CI `npm ci` failed: lock file missing Linux-only optional deps

- npm on Windows omitted `yaml` and rolldown's wasm-binding deps (`@emnapi/core`, `@emnapi/runtime`) from package-lock.json; `npm ci` on Linux rejects the lock.
- Fix: refreshed the lock and pinned both `@emnapi/*` packages (2.0.0-beta.2) as devDependencies so every OS records them. Remove once npm/rolldown fix optional-dep locking.

## [2026-11-21] bug | @visual snapshots passed after the whole scene changed

- Symptom: on `feat/empty-room-twin-1` the solid-wall room matched the old wireframe baselines; CI passed and update-snapshots said "Baselines unchanged."
- Cause: Playwright's default per-pixel `threshold` (0.2) treats ASHERA's dark colours as equal (15% of pixels really differ, 0.26% counted). Bare `--update-snapshots` (=changed) then kept the stale baselines.
- Fix: `threshold: 0.02` in `playwright.config.ts` (measurements in docs/testing.md); update-snapshots uses `--update-snapshots=all`.
- Test: `e2e/visual-threshold.spec.ts` — "visual comparison catches a dark-on-dark change".
