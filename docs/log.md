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

## [2026-11-21] decision | Wall compass names re-assigned

- TV wall (faced on entering) is now **north**; Window wall **west**; Door wall **south**; the wall the open Door rests against **east**. These are real compass directions (owner confirmed), so no ADR. Previously TV = east, Window = north, Door = west.
- Footprint becomes 10 ft west–east × 9 ft south–north; Beams on west/south/east; no Beam on the north (TV) wall. GLOSSARY.md and room-spec.md updated; `room.config.ts`, its tests and ADR 0001's example still use the old names (to change in the Phase 1 spec).

## [2026-11-21] decision | Phase 1 empty-room twin grilled

- Cutaway (walls/ceiling facing an outside camera hidden); Door fixed open against the east wall with its swing arc on the floor; View buttons in the Header (`?view=` kept for tests).
- Walls 0.5 ft thick (placeholder), growing outward; faint 4 × 2 ft floor-tile lines; window = frame + dark glass, no curtains; wall fittings drawn as flat plates at photo-estimated placeholder positions.
- Photo Views judged by eye against docs/reference/photos; e2e checks camera positions only. Out of scope: Items, Door interaction, scene clicking, distances, lighting previews.

## [2026-11-21] feature | Empty-room twin slice 1: walls from data

- `room.config.ts` uses the real compass names (TV = north, Window = west, Door = south), 10 × 9 ft; `walls.thickness` added (0.5 ft placeholder, grows outward); ADR 0001 example fixed.
- Scene builds floor, ceiling, Walls cut around their Openings (`wallPieces`) and Beams from config; `PlaceholderRoom` removed. Cutaway (`hiddenSurfaces`) re-runs whenever the camera moves; a Wall's Beam hides with it.
- `__ASHERA__` gains `pieces`, `beams`, `hidden`. Top View camera raised from 24 to 30 ft so the thick Walls fit the frame.

## [2026-11-21] decision | Doorway, window, wall and skirting measurements grilled

- Measured: Doorway 7′ 2″ × 3′ 1″ inside its ~1″ frame (frame drawn as part of the Wall, so the Door swing radius becomes 3′ 1″); window 5′ 9″ wide × 5′ 6″ tall; Walls 6″ (0.5 ft) thick.
- Placeholders: skirting depth ⅝″ (0.05 ft; height stays 0.3 ft); Door leaf thickness 1½″ (0.125 ft); window sill 3.5 ft (top meets the Beam underside at 9 ft) and centred on the west Wall.
- Recorded in docs/room-spec.md; `room.config.ts` changes in the next slice.

## [2026-11-21] feature | Empty-room twin slice 2: skirting and Door

- Measured doorway (3′ 1″ × 7′ 2″), window (5′ 9″ × 5′ 6″, centred, offset 1.625) and 6″ Walls now in `room.config.ts`; `skirtingHeight` became `skirting { height, depth, placeholder }`; `Door` gained `thickness` and `placeholder`; `validateRoom` rejects non-positive skirting depth/height and Door thickness.
- `skirtingRuns` (room) breaks Skirting wherever an Opening reaches below its top (the doorway, not the window); the scene draws it inside each Wall's group so Cutaway hides it with its Wall. `doorSwing` gives the hinge, 3′ 1″ radius and quarter-circle arc; the Door leaf is fixed open 90° flat against the east Wall with a faint arc on the floor. `wallFrame` moved out of `roomBoxes.ts` so both share it.
- `__ASHERA__.door.openAngleDeg` added. Skirting and leaf use plain placeholder colours until the dark look (slice 4).
