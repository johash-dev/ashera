# Work log

Append-only, newest at the bottom. One entry per feature, bug fix, decision or refactor.
Format: `## [YYYY-MM-DD] feature|bug|fix|decision|refactor|docs|chore | title`, then 1–4 bullets (what, why, links). `npm run docs-check` enforces the header.
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
- Review follow-ups (known simplifications): the open leaf is drawn through the 0.05 ft Skirting on the east Wall, not offset from it; the leaf is not Cutaway with its Wall, so from outside it shows as the clearance zone. Skirting boxes overlap in corner squares; mitre them when real materials arrive (slice 4).

## [2026-11-21] feature | Empty-room twin slice 3: Fittings

- `Room.fittings` added: `{ id, kind, surface: WallId | 'ceiling', centre: [u, v], size: [w, h], placeholder }`. On a Wall `u` runs along it from its start corner and `v` is height above the floor; on the ceiling, distances from the west and north Walls.
- Five Fittings, all placeholders estimated from the photos (no measurements yet): north double socket and data plate, south switch plate and double socket, 2 × 2 ft ceiling light centred. Values in docs/room-spec.md.
- `validateRoom` rejects a Fitting outside its surface (past a Wall's end, above its clear height, or off the ceiling). `fittingPlate` (scene) places each as a flat plane 0.01 ft off its surface, facing into the Room; it is drawn in its Wall's group, or in a new ceiling group, so Cutaway hides it with its surface.
- `__ASHERA__.fittings` (count) added. Plates share one plain placeholder colour; the ceiling light becomes emissive in slice 4.

## [2026-11-21] fix | Slice 3 review fixes: Fitting validation and drawn count

- `validateRoom` also rejects a Fitting that overlaps an Opening on its Wall, has a non-positive size, or repeats another Fitting's id (the id is the plate's React key).
- `__ASHERA__.fittings` now counts the plate meshes mounted in the scene (reported on the first frame) instead of `room.fittings.length`, so the e2e check fails if no plates render.
- Noticed, not fixed: the doorway height in `room.config.ts` is `43 / 12` (3.58 ft) although its comment and room-spec say 7′ 2″ (`86 / 12`), so the doorway and Door leaf are drawn half height (from slice 2). Also still open from review: a plate low on a Wall can sit inside the Skirting, and a ceiling plate over a Beam is hidden by it; current config is clear of both.

## [2026-11-22] bug | Doorway, header and Door leaf drawn at half height

- Symptom: in `?view=overview` the doorway, the Wall header above it and the Door leaf were about half the expected height.
- Cause: `doorway.height` in `room.config.ts` was `43 / 12` (3.58 ft) although the comment and `docs/room-spec.md` say 7′ 2″ = 86 in; slice 2 (PR #4) converted 43 in, not 86 in, and the tests pinned the wrong value.
- Fix: `height: 86 / 12`; pinned values in `geometry.test.ts`, `wallPieces.test.ts`, `roomBoxes.test.ts` corrected (header 2.3333 ft tall, Door leaf 7.1667 ft tall). `validateRoom(ASHERS_ROOM)` still empty (test: "has the measured doorway (3′ 1″ × 7′ 2″) and window (5′ 9″ × 5′ 6″)").
- @visual baselines need regenerating via the `update-snapshots` workflow.

## [2026-11-22] decision | Harness slice 1: owner approves intent and the look, the agent merges

- Retro of 9 sessions + research (Karpathy, Pocock, Huntley, Anthropic, Willison, Beck): the owner was pulled in for merges, snapshot runs, CI re-runs, review-fix choices and "what's next?". ADR 0004 limits owner asks to intent, the look, one-way doors, real-world facts and gate changes.
- New `/ship` (slice end to end, Approval card, merge on "looks good") and `/next`; `/implement` and `/review` stop asking engineering questions.
- Enforced: `approval.mjs` records the owner's "looks good"; `git-guard.mjs` allows a PR merge only in auto mode (GitHub waits for checks), never bypassing protection, and only with a fresh approval; `git pull` on main must be fast-forward only. Hook tests in `.claude/hooks/hooks.test.mjs`.
- Settings: routine git/gh commands allowed; edits to workflows, `verify`, Playwright config, hooks and settings prompt (gate changes).
- Tracer: PR #6 (doorway fix) merged through the gate on the owner's "looks good" — one owner reply, no GitHub clicks.

## [2026-11-22] decision | Harness slice 3: correctness the owner can't eyeball

- `docs/room-spec.md` gets a "Measured values" table (config path, value as measured); `src/room/measurements.test.ts` converts each and checks `room.config.ts`. With the doorway at `43 / 12` it fails on `openings.doorway.height = 7′ 2″` — the bug that passed tests and two reviews.
- `reviewer` runs `verify --fast`, re-derives every number in the diff (unit conversions included) and starts with a verdict line.
- `/ship` compares the after-screenshot with the matching reference photo before the Approval card; the Stop hook also lints changed script and code files.

## [2026-11-22] chore | Harness slice 4: plain-language discussion and hygiene

- `/grill`: plain words with terms explained inline, a recommended answer per question, restate room facts from the photos before asking, settle engineering choices without asking, then go straight to `/spec`. `/spec` and the template: "you'll see" per slice, measured-values row in Done when, `/ship` starts on approval. `/diagnose` writes its own brief from a one-sentence report.
- git-guard judges each part of a chained command on the branch it runs on (no more "push to main" for `--base main`, or "merge to main" after `git switch feat/x`). Tests added.
- `docs/log.md` merges with `merge=union`; `docs-check` enforces log headers (`feature|bug|fix|decision|refactor|docs|chore`).
- Not done: Vite `strictPort: false` — the preview tool needs a fixed port, so the second launch entry (5174) stays the answer to parallel chats.

## [2026-11-22] decision | Harness slice 2: baselines and CI with no owner clicks

- `update-snapshots` now uploads a `baselines` artifact instead of committing as the bot; the agent downloads, commits and pushes it, so CI runs on the PR normally (the bot commit on PR #6 left it with no checks).
- New integrity check, first step of CI `verify`: fails on added `.only`/`.skip`, fewer test cases, or a touched gate file, unless the owner adds the `gate-change` label (git-guard blocks the agent from adding it). Tests: `scripts/integrity-check.test.mjs`.
- `scripts/screenshots.mjs` saves every View for the owner's Approval card; PR evidence is GitHub's image diff of the changed baselines, no PNGs committed elsewhere.

## [2026-11-22] feature | Empty-room twin slice 4: dark look

- One accent colour for the whole app: the Header's violet `#7c5cff` (`--accent`), used in the scene for the faint floor-tile joints. All scene colours live in `src/scene/look.ts`.
- Lighting: the ceiling light is a soft-white glowing panel plus a point light just below it (drawn outside the ceiling group, so Cutaway never switches it off); dim ambient and key lights only fill the shadows.
- Window: four frame bars and one dark pane (`windowBoxes`), centred in the Wall; new `windowFrame` in config (placeholder). Floor-tile joints from `floorTileLines` (`floorTile` in config, placeholder), drawn as one line set.
- `__ASHERA__.drawCalls` (previous frame's `renderer.info.render.calls`): 19 in `overview`; e2e asserts < 100.
- Noticed: the frame's top and left bars hide inside the Wall reveal from `overview`; they show head-on in the slice 5 window View. "No console errors in any View" is only checked for `overview` until slice 5 adds the other Views.

## [2026-11-22] feature | Empty-room twin slice 5: Views

- Photo Views `entrance`, `window`, `left`, `right` at eye height (5 ft), fov 65°, standpoints estimated from `docs/reference/photos` (owner confirms on the Approval card). View buttons in the Header; `CameraRig` moves camera and orbit target on a View change.
- Canvas now `frameloop="demand"` (docs/r3f.md): with full-screen photo Views and six parallel e2e workers on software WebGL, continuous rendering starved the CPU and e2e timed out (even the non-WebGL swatch test took 41 s). Draw calls are now read after each rendered frame (`addAfterEffect`).
- Look tweaks seen in the photo Views: the ceiling light's cast light moved below the Beams; window glass rougher (the light's reflection read as a moon).
- Photos are portrait, the app landscape: each View matches the photo's height and aim, but shows more to the sides.
- Owner asked on the Approval card for the Door leaf in brown wood like the photo: `LOOK.doorWood` `#7a4a28` (plain colour, no grain), moved from a local constant in `Doors.tsx` into `look.ts` with the other scene colours.

## [2026-11-22] decision | Empty-room twin spec done

- Slice 5 merged (#12) after the owner's "looks good" on the Approval card, which compared the four photo Views side by side with `docs/reference/photos`; the Door leaf became brown wood on the owner's request.
- All Done-when items checked. Per ADR 0004 the owner's approval and the before/after screenshots live on the chat Approval cards, not in the PRs.
- Still open (spec "Open questions"): placeholder measurements (window sill and position, skirting depth, Door thickness, Fitting positions) and the photo standpoints, which are estimates.

## [2026-11-22] decision | TV wall spec approved

- Phase 2 starts with the props, not the controls: the owner wants the furniture pieces built first and moving them left to a later phase. The first feature is the TV wall (`docs/specs/tv-wall.md`, 4 slices), based on the owner's sketch and a mood picture shared in chat.
- Agreed: a floating black stand (8 × 1.5 × 1 ft, hung 6 in off the floor), the TV on its own feet on the stand (the owner chose this over wall-mounting twice, although the picture shows the TV on the wall), a top-bar 55″/65″ switch, the PS5 upright on the left, a soundbar, and a Slat panel over the whole TV wall with cut-outs for its Fittings. The controller, the plant and the green under-glow come later.
- No new Room measurements. TV, PS5, soundbar and slat sizes are typical sizes until the owner names product models.

## [2026-11-22] feature | TV wall slice 1: the TV stand

- The `editor` module is live: `CATALOG` with the TV stand (8 × 1.5 × 1 ft, two doors, from the owner's sketch) and `tvWallItems(room)`, the starter arrangement — the stand centred on the TV wall, its back against the Wall, underside 0.5 ft and top 2 ft above the floor.
- Drawn as a near-black body with two door fronts a shade lighter (`standBoxes`, colours in `look.ts`); the first, all-black version hid the doors in every View. `__ASHERA__.items` lists type, size and centre of each Item drawn.
- No new Room measurements, so no new "Measured values" rows. The low TV socket is hidden behind the stand, as the spec expected.
- Door-swing and Item-to-Item checks come in slice 2, with the second Item (the TV); the stand stands about 4.9 ft clear of the Door swing.

## [2026-11-22] feature | TV wall slice 2: TV and the size switch

- Catalog gains the 55″ and 65″ TVs (typical panels 48.4 × 27.9 in and 57.0 × 32.7 in, 2 in deep, on 3 in legs; placeholders). `tvWallItems(room, tvSize)` stands the TV on the stand top, centred, its back 3 in in front of the stand's back so the front stays free for the soundbar.
- Header button "TV 55″/65″" and `?tv=55|65` pick the size (default 55, not remembered after a reload); `__ASHERA__.tvSize` reports it. New @visual baseline `overview-tv65.png`.
- Rules now checked for both sizes: every Item inside the Room, no two intersecting (`itemsIntersect`, touching allowed), none in the Door swing (`clearOfDoorSwing`, conservative: the whole circle the leaf's end can reach). `wallFrame` and `doorSwing` moved from `scene` to `room` so the editor can use them; behaviour unchanged.
- Look: dark glossy screen inside a faintly lit edge (`LOOK.tvScreen`, `LOOK.tvEdge`); the first, unlit edge vanished against the Wall. On the Approval card the owner asked why the feet were blocks and chose two thin legs slanting outward (35°, / \ from the front) over a central pedestal.
- With 65″ the screen top is at 4.98 ft and the data plate (centred at 5 ft) shows only its top half above the TV — the spec's open question, now visible.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-22] feature | TV wall slice 3: PS5 and soundbar

- Catalog gains the PS5 (slim, upright: 3.8 in wide × 14.1 in high × 8.5 in deep) and a soundbar (2.5 ft × 2.6 in × 4 in), both placeholders. On the stand: the PS5's west side 1 ft in from the stand's west end, centred front to back; the soundbar centred under the TV, front flush with the stand's front.
- The soundbar (2.6 in tall) stays below the screen, which starts 3 in above the stand on its legs. New unit test: everything on the stand stays within its top (the reviewer's slice 2 note).
- Look: PS5 white side panels around a black core; soundbar near-black with a slightly lighter front grille, lightened once after it vanished in the entrance View.
- All four TV-wall Items are now listed in `__ASHERA__.items`, with the inside-Room, no-overlap and Door-swing checks run for both TV sizes.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-22] feature | TV wall slice 4: Slat panel

- `SLAT_PANEL` in the Catalog (1 in slats, ½ in gaps, ¾ in deep overall: ¼ in felt backing plus ½ in slats; ½ in clearance round each Fitting; placeholder). `slatPanelSlats` / `slatPanelBacking` give 80 slat columns centred corner to corner on the TV wall, floor to ceiling, each broken around the cut-outs from `slatPanelCutouts` (one per TV-wall Fitting).
- Drawn as two instanced meshes (`SlatPanel.tsx`): black slats a shade lighter than the felt so the ribs read. Draw calls: 33 in `overview`, 38 in `entrance` (budget < 100).
- Every Item now stands off the panel face: the stand's back moved ¾ in forward (centre z −4 → −3.9375; the e2e expectation changed with it). The TV, PS5 and soundbar move with the stand.
- The data plate shows through its cut-out, set back ¾ in behind the slat faces. Under the east and west Beams the slats stop at the Beam underside (9 ft).
- Review found Cutaway left the panel standing when the north Wall hid (camera north of the Room); `RoomShell` now takes `wallContents`, drawn inside each Wall's group, and the panel is the north Wall's. Checked by orbiting behind the TV wall; no automated test for it.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-22] decision | TV wall spec done

- Slice 4 merged (#18) after the owner's "looks good"; all four slices (#15–#18) went through Approval cards with before/after screenshots of every View plus `overview` at 65″. All Done-when items checked.
- Changes the owner asked for on the cards: angled TV legs instead of blocks (slice 2).
- Still open (spec "Open questions"): product models for the TV, PS5, soundbar and Slat panel (all typical sizes); the data plate half hidden behind the 65″ TV; whether the Skirting peeks through the slat gaps at floor level.

## [2026-11-22] decision | Roadmap for the rest of the Room

- Grill with the owner: seven features after the TV wall, in order — desk and sofa, wall décor, surround sound, moving furniture and Layouts, lighting preview, smart devices and control, shopping and labour list (docs/concept.md "Roadmap").
- Desk on the east wall between the TV stand and the Door swing; sofa on the south wall from the window corner, switchable between a compact 2–3 seater and an L-shape; low, slim-armed, charcoal fabric; gaming chair and dark rug; fixed in place for now (docs/room-spec.md "Planned items").
- The sound system must be controllable from ASHERA, including the surround mode; hardware is chosen in the surround sound feature with that in mind.
- No new Room measurements. Desk height, monitor and tower sizes are typical until measured.

## [2026-11-23] feature | Desk and sofa slice 1: the desk

- Items gain a Facing; `itemBox` turns an Item into its box along the Room axes, and the no-overlap and Door-swing rules now use it (moved from `tvWall.ts` to `items.ts`). TV-wall Items face south.
- Catalog gains Asher's computer desk (4 × 2 ft from the owner, top 30 in high: typical, placeholder). `starterArrangement` = TV wall + `deskItems`: the desk against the east wall, facing west, its north end level with the TV stand's front, about 0.9 ft clear of the Door swing.
- Drawn as a top on four square legs (`deskBoxes`); the first, darker top vanished against the floor in the top-down View, so it is a shade lighter than the floor. `__ASHERA__.items` now reports each Item's facing.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Desk and sofa slice 2: desk setup and gaming chair

- Catalog gains the monitor (27″), PC tower, keyboard, mouse and gaming chair (all typical sizes, placeholders). `deskItems` now places them: monitor centred at the back against the wall, keyboard 3 in from the desk's front, mouse just south of it (Asher sits facing east, so his right is south), PC tower at the south end, chair centred on the desk facing east with its front touching the desk's front.
- Unit tests: every desk-top Item rests on and within the desk top; the chair stands on the floor at the desk. The existing inside-Room, no-overlap and Door-swing checks run over all of them for both TV sizes. `__ASHERA__.items` lists them.
- Drawn from simple boxes (`itemBoxes.ts` places parts in each Item's own frame, so facing is handled in one helper): monitor on a foot and neck, tower with a lighter front panel, keyboard with a key block, mouse, chair with a base, column, seat, tall backrest and armrests. Look: near-black gear, a chair a shade lighter than the floor; no accent colour.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Desk and sofa slice 3: compact sofa

- Catalog gains the compact sofa (5½ × 2½ × 3 ft, typical, placeholder). `sofaItems` places it against the south wall, west end on the window wall face, facing north; it ends about 1½ ft short of the Door swing's reach and its top (2½ ft) is below the 3½ ft window sill. Unit tests check each of these; the inside-Room, no-overlap and Door-swing checks run over it for both TV sizes. `__ASHERA__.items` lists it.
- Drawn from a base, a low back, two slim arms and two seat cushions (`sofaBoxes`); charcoal frame with slightly lighter cushions.
- Owner on the slice 2 card: the chair looks fine for now; its position and look will be revisited when Layouts arrive (feature 4).
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Desk and sofa slice 4: L-shaped sofa and the sofa switch

- Sofa choice (`compact` or `l`) is app state like the TV size: a Header button ("Sofa: compact / L-shaped"), `?sofa=compact|l` (`sofaFromSearch`), and `window.__ASHERA__.sofa`. `starterArrangement` takes it.
- The L-shaped sofa is two Items: the long side (5½ × 2½ × 3 ft, same spot as the compact sofa) and a short side on the window wall face facing east, touching the long side's front. Spec correction: the short side is 2 ft along the wall × 3 ft deep (the spec table said 3 × 2); that is what makes the 5 ft up the window wall overall (3 + 2) and matches "3 ft deep" in docs/room-spec.md. Unit tests: both sofas × both TV sizes stay inside the Room, clear of each other and the Door swing; every sofa piece is below the window sill.
- Drawn with one `sofaBoxes` for all three pieces: arms only at the free ends (the L's two sides join at the corner), one cushion on the narrow short side. Draw calls with the L: 47–74 across the Views (budget < 100).
- New `overview-sofa-l` visual baseline (spec: one extra baseline at `?sofa=l`).
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Desk and sofa slice 5: rug

- Catalog gains the rug (5 ft west–east × ½ in × 3½ ft, dark, typical, placeholder). `rugItems` puts its east edge level with the desk's front (so the gaming chair stands on it), centred north–south between the TV stand's front and the compact sofa's front; the same spot for both sofas, so the L's short side stands on its edge.
- Rule: a rug is a floor covering, so `itemsIntersect` never counts it as overlapping anything (new glossary term); the inside-Room and Door-swing checks still apply to it. Unit tests for its size, spot, and those checks.
- Drawn as one flat box, a shade lighter than the floor with a faint violet cast so its edge reads. Draw calls 48–75 across the Views with either sofa (budget < 100).
- Spec reading: "east edge at the chair" taken as the chair standing on the rug (east edge level with the desk front); if Asher wants the rug clear of the chair, it is one line in `rug.ts`.
- All five slices of the spec are in; the spec is marked done once the owner approves this slice.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] decision | Desk and sofa spec done

- Slice 5 merged (#24) after the owner's "looks good"; all five slices (#20–#24) went through Approval cards with before/after screenshots of every View, plus `overview` with the L-shaped sofa. All Done-when items checked.
- Changes the owner asked for on the cards: none. On slice 2 the owner noted the gaming chair's position and look will be revisited when Layouts arrive (roadmap feature 4).
- Spec correction made in slice 4: the L-shaped sofa's short side is 2 × 2½ × 3 ft (2 ft along the window wall, 3 ft deep).
- Still open: product sizes for the desk, monitor, tower, chair, sofas and rug (all typical); the L's corner has no back along the window wall; whether the chair should stand on the rug.

## [2026-11-23] feature | Wall décor slice 1: pegboard

- Spec `wall-decor` written and approved after a grill: pegboard with headphones and shelf above the desk, three frames above the sofa, typical sizes, dark placeholder art.
- Catalog gains the pegboard (4 ft × 2 ft × 1 in, typical, placeholder). `wallDecorItems` hangs it on the east wall face, facing west, centred on the desk, bottom edge 4½ ft up (above the monitor's top, below the Beam). Unit tests for its size, place, height and Door swing; the starter arrangement's inside-Room, below-Beam, no-overlap and Door-swing checks run over it for every TV size and sofa. `__ASHERA__.items` lists it; an e2e checks its spot.
- Drawn as one flat black box. In the overview the open Door leaf hides most of it; it shows clearly in the right-from-entrance and entrance Views.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Wall décor slice 2: headphones and shelf on the pegboard

- Catalog gains the headphones (7 × 8 × 3½ in, hung on a hook) and a small pegboard shelf (12 × 1 × 4 in), both typical placeholders. `wallDecorItems` stands them on the pegboard's front face: headphones in its north third (Asher's left as he sits), top ½ ft below the board's top; shelf in its south third at the board's mid-height. Unit tests: right Catalog size, on the board's face and within its outline, which third each sits in, shelf at mid-height; the starter arrangement's checks run over them for every TV size and sofa.
- Drawn from simple boxes: headphones as a band, two cups and a hook; the shelf as one board. Near-black, lighter than the board so they read.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] feature | Wall décor slice 3: three picture frames

- Catalog gains the picture frame (1 ft × 1½ ft × 1 in, typical placeholder). `wallDecorItems` hangs three on the south wall, facing north, backs on the wall face, bottom edge 4 ft up (above the sofa's 2½ ft top), 6 in apart, the middle one centred on the sofa's long side; the same spot for both sofas. Unit tests per sofa: Catalog size, wall face, height, spacing, centred on the sofa, below the Beam, clear of both south-wall Fittings. An e2e checks the spot and that `?sofa=l` leaves the frames unchanged.
- Drawn as a black body with dark art inset in front and a thin accent-violet line across the art (placeholder art); three boxes per frame. Draw calls stay under the budget in every View.
- All three slices are in; the spec is marked done once the owner approves this slice.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-23] decision | Wall décor spec done

- Slice 3 merged (#28) after the owner's "looks good"; all three slices (#26–#28) went through Approval cards with before/after screenshots. All Done-when items checked.
- Changes the owner asked for on the cards: none.
- Still open: real sizes for the pegboard, headphones, shelf and frames (typical until measured); the pegboard's holes are not drawn; real pictures for the frames (later feature).

## [2026-11-23] feature | Object detail slice 1: desk setup

- Spec `object-detail` written and approved after a grill: a look-only pass over every existing Item, one group per slice; no sizes, spots or Catalog entries change.
- Desk gains an apron under the top front and back and a low stretcher at each end. Monitor gains a housing and neck behind the panel, a wider foot and a small accent status light. PC tower stands on two feet with a lighter front panel, five air-vent slots, a glowing accent strip and a dark glass side on its north face. Keyboard is a low body with five rows of keys and gaps between rows. Mouse has a shell, hump, two buttons and a glowing scroll wheel. Gaming chair has a five-star base on casters, seat bolsters, a backrest with headrest, side wings and two dim accent stripes, and two armrests.
- Parts of an Item that share a material are merged into one mesh (`mergedBoxes.ts`), so the desk setup now costs 16 draw calls instead of 23 despite far more parts. Every part lies within its Item's size box (unit tests); the old keyboard keys and tower front panel stood slightly outside it and now sit inside.
- Looked at against the reference photos: none show the desk setup, so no comparison was possible; the owner corrects the look on the Approval card.
- No new Room measurements, so no new "Measured values" rows.

## [2026-11-24] feature | Object detail slice 2: TV wall

- TV stand gains a top slab, doors set into its front and a handle bar on each door's inner edge. TV is now a thin panel with a housing behind its middle, a status light in the bottom edge and the same slanted legs. PS5 stands on a base plate with a glowing strip down its front. Soundbar gets a status light in its end edge.
- Doors, handles, screen, grille and lights are now set into each Item's own box instead of standing a hair outside it, so every drawn part lies within its Item's size box (unit-tested). Sizes and spots unchanged.
- Parts sharing a material are merged into one mesh each (as in slice 1). Draw calls: 62 in the entrance close-up; every View stays under the budget (< 100).
- The Slat panel is already slats on a felt backing in one instanced draw, so it was left as is; the glow under the TV stand stays with the later lighting feature.
- No new Room measurements, so no new "Measured values" rows.
