---
status: done # draft | approved | in-progress | done | superseded
updated: 2026-11-22
phase: 1
---

# Empty-room twin

## Goal

Asher opens ASHERA and sees his empty Room built accurately from `room.config.ts`: Walls with the doorway and window, Beams, Skirting, the open Door, Fittings and the dark look. He can orbit it, and jump to preset Views that match the reference photos.

## User stories

- As Asher, I can orbit around the Room and still see inside it (Cutaway), so I can judge the space.
- As Asher, I can click a View button to see the Room from where each reference photo was taken, or from above.
- As Asher, I can see the Door swing on the floor, so I know which area must stay clear.
- As the Owner, I can change a measurement in `room.config.ts` and see the Twin update with nothing else edited.

## Invariants

- Every rendered dimension and position comes from `room.config.ts` (CODING_STANDARDS 8). No literals in components.
- Wall names are real compass directions: TV wall = north, Window wall = west, Door wall = south (room-spec.md).
- Walls grow **outward** by their thickness; the interior stays 10 ft (west–east) × 9 ft (south–north) × 9.5 ft.
- Cutaway: a Wall is hidden when the camera is on its outer side; the ceiling is hidden when the camera is above it. Nothing is hidden when the camera is inside the Room.
- `validateRoom(ASHERS_ROOM)` returns `[]`.

## Out of scope

Items and furniture; opening/closing the Door; clicking anything in the scene; distance read-outs; accent/LED lighting previews (Phase 3); wall brick pattern and textures; curtains, curtain rod, outside view, daylight; animated camera moves.

## Data model

Changes to `Room` (`src/room/types.ts`); none is persisted, so no one-way door.

- Wall names re-assigned (config values and tests). `width` = 10, `depth` = 9. Doorway on `south`, offset 0 (from the SE corner), hinge `start`; window on `west` (offset 1.625 from slice 2); Beams on `west`, `south`, `east`.
- `walls: { thickness: 0.5; placeholder: true }` — new. Measured 6″ in slice 2 → `placeholder: false`.
- Measured in slice 2 (room-spec.md): doorway `width` 3′ 1″ (37/12 ft), `height` 7′ 2″ (43/12 ft), measured inside its ~1″ frame; the frame is drawn as part of the Wall; `placeholder: false`. Window `width` 5′ 9″ (5.75), `height` 5′ 6″ (5.5), `offset` 1.625 (centred), `sill` 3.5 — sill and position stay `placeholder: true`.
- `skirtingHeight` → `skirting: { height: 0.3; depth: 0.05; placeholder: true }` (depth ⅝″) — slice 2.
- `Door` gains `thickness: 0.125` (1½″) and `placeholder: true` — slice 2. The open leaf lies flat against the east Wall.
- `floorTile: { length: 4; width: 2; longSide: 'north-south'; placeholder: true }` — new; grid starts at the south-west corner.
- `windowFrame: { width: 0.1; depth: 0.2; placeholder: true }` — new in slice 4 (frame bar width and depth, centred in the Wall).
- `fittings: Fitting[]` — new. `Fitting = { id; kind: 'double-socket' | 'switch-plate' | 'data-plate' | 'ceiling-light'; surface: WallId | 'ceiling'; centre: [u, v]; size: [w, h]; placeholder }` — on a Wall, `u` runs along it from its start corner and `v` is height above the floor; on the ceiling, distances from the west and north Walls (slice 3). Initial set from the photos: north double socket + data plate; south switch plate + double socket; ceiling light. All placeholders.
- `validateRoom` also rejects a Fitting outside its surface.

No new dependencies. ADR 0001's example line ("north/window wall is at −z") is corrected to the TV wall.

## Testing seams

Unit (Vitest, `src/room` and `src/scene` pure helpers):

- `wallPieces(room, wall)` — solid rectangles of a Wall around its Openings, in wall-local feet.
- `hiddenSurfaces(room, cameraPosition)` — which Walls and whether the ceiling are Cutaway.
- `doorSwing(room, door)` — hinge point, radius (= doorway width) and the swept quarter-circle.
- `floorTileLines(room)` — grid line positions from `floorTile`.
- `validateRoom` — new Fitting, wall-thickness, skirting-depth and Door-thickness rules.

E2E (Playwright, via `window.__ASHERA__`): `room`, per-Wall `pieces` and `hidden`, `beams`, `door`, `fittings`, `view`, `drawCalls` (`renderer.info.render.calls`). View buttons and `?view=`.

Visual (`@visual`, CI-only baselines): one snapshot per View; baselines regenerated per slice via the `update-snapshots` workflow.

## Done when

All must pass:

- [x] `npm run verify` prints ALL GREEN
- [x] Unit: `wallLength(north) = 10`, `wallLength(west) = 9`; `clearHeightAtWall(north) = 9.5`, `clearHeightAtWall(west) = 9`
- [x] Unit: `wallPieces` gives 1 piece for north and east, 4 for west (around the window), 2 for south (around the doorway)
- [x] Unit: `hiddenSurfaces` from the `overview` camera hides `south`, `east` and the ceiling; from a camera inside the Room hides nothing
- [x] Unit: `doorSwing` radius = 37/12 ft (3′ 1″, the doorway width), hinge at the south-east corner, arc sweeps from the doorway to the east Wall
- [x] Unit: `validateRoom` rejects a non-positive `skirting.depth` and a non-positive Door `thickness`
- [x] Unit: `validateRoom` rejects a Fitting past the end of its Wall, above its clear height, or outside the ceiling
- [x] E2E: `__ASHERA__.room` = `{ width: 10, depth: 9, ceilingHeight: 9.5 }`; `beams` = `['west', 'south', 'east']`; `door.openAngleDeg` = 90; `fittings` = 5
- [x] E2E: each View button (Overview, Top, Entrance, Window, Left, Right) sets `__ASHERA__.view` and the Header label; `?view=<id>` selects the same View on load
- [x] E2E: `drawCalls` < 100 in `overview`; no console errors in any View
- [x] Owner judges `entrance`, `window`, `left` and `right` screenshots side by side with the matching `docs/reference/photos/` image and approves them in the PR
- [x] Screenshots of affected Views attached to each PR
- [x] room-spec.md, architecture.md (if module APIs change) and `docs/log.md` updated per slice

## Slices

Each slice is one PR, leaves `verify` green, and regenerates visual baselines.

1. **Tracer — walls from data.** Wall names fixed in config, tests and ADR 0001; `walls.thickness` added; floor, ceiling, four Walls with the doorway and window cut out (`wallPieces`), Beams; Cutaway (`hiddenSurfaces`); plain dark material; `PlaceholderRoom` removed; `__ASHERA__` gains `pieces`/`hidden`/`beams`.
2. **Skirting and Door.** Measured doorway, window and wall values into config; `skirting` group and Door `thickness`; Skirting (`skirting.height` × `skirting.depth`) along every Wall, broken at the doorway; Door leaf (`thickness` thick) fixed open 90° flat against the east Wall; faint Door swing arc (`doorSwing`); `__ASHERA__.door`.
3. **Fittings.** `fittings` in config and `validateRoom`; flat plates on Walls and ceiling at photo-estimated placeholder positions; `__ASHERA__.fittings`.
4. **Dark look.** Final materials with the one accent colour, few lights, emissive ceiling light; window frame + dark glass; faint floor-tile lines (`floorTileLines`); `drawCalls` exposed and asserted.
5. **Views.** `entrance`, `window`, `left`, `right` presets (camera ~5 ft high, placed and aimed from each photo); View buttons in the Header; owner photo comparison.

## Open questions

- Floor-tile direction and grid start (placeholder: long side north–south, from the south-west corner).
- Window sill height, position along the west Wall, and whether 5′ 6″ includes its frame (placeholder sill 3.5 ft, centred).
- Skirting depth (placeholder ⅝″) and Door leaf thickness (placeholder 1½″) — measure when convenient.
- Whether the real open Door stops short of the east Wall on its floor door-stop (assumed flat against the Wall).
- Fitting positions and sizes — measure before slice 3 (else photo estimates stay placeholders).
- Where each reference photo was taken from (standing spot, facing) — the Owner confirms during slice 5.
