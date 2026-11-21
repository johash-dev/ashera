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

## [2026-11-21] decision | Wall compass names re-assigned

- TV wall (faced on entering) is now **north**; Window wall **west**; Door wall **south**; the wall the open Door rests against **east**. These are real compass directions (owner confirmed), so no ADR. Previously TV = east, Window = north, Door = west.
- Footprint becomes 10 ft west–east × 9 ft south–north; Beams on west/south/east; no Beam on the north (TV) wall. GLOSSARY.md and room-spec.md updated; `room.config.ts`, its tests and ADR 0001's example still use the old names (to change in the Phase 1 spec).

## [2026-11-21] decision | Phase 1 empty-room twin grilled

- Cutaway (walls/ceiling facing an outside camera hidden); Door fixed open against the east wall with its swing arc on the floor; View buttons in the Header (`?view=` kept for tests).
- Walls 0.5 ft thick (placeholder), growing outward; faint 4 × 2 ft floor-tile lines; window = frame + dark glass, no curtains; wall fittings drawn as flat plates at photo-estimated placeholder positions.
- Photo Views judged by eye against docs/reference/photos; e2e checks camera positions only. Out of scope: Items, Door interaction, scene clicking, distances, lighting previews.
