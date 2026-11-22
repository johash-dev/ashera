---
status: in-progress # draft | approved | in-progress | done | superseded
updated: 2026-11-22
phase: 2
---

# TV wall

## Goal

Asher sees his planned TV wall in the Twin at real size: the floating TV stand, the TV on it, the PS5, the soundbar and the black Slat panel behind them. He can switch the TV between 55″ and 65″ to compare. First Phase 2 feature: Items exist and are drawn; moving them comes later.

## User stories

- As Asher, I can see the TV wall from the photo Views and judge how big it feels in the Room.
- As Asher, I can click one Header button to switch the TV between 55″ and 65″ and compare them in every View.
- As the Owner, I can change an Item's size in one place and see the Twin update with nothing else edited.

## Invariants

- All sizes in feet (ADR 0001). Item sizes live only in the Catalog; positions only in the starter arrangement, derived from `room.config.ts` (TV wall face, Room width) and the sizes — no literals in components.
- Every Item sits inside the Room and no two Items intersect (resting on top of one another is touching, not intersecting).
- No Item enters the Door swing.
- The Slat panel covers the whole TV wall, corner to corner and floor to ceiling, with cut-outs around the TV wall's two Fittings; Items stand off its face, not the bare Wall.
- Draw calls stay under the existing e2e budget (< 100): the Slat panel's repeated slats are drawn instanced (docs/r3f.md).

## Out of scope

Selecting, dragging, rotating or snapping Items; adding or removing Items; Layouts, saving, export/import; distance read-outs; controller, plant and other décor; the green glow under the stand and any accent lighting (Phase 3); real product models or textures; remembering the chosen TV size after a reload.

## Data model

New in the `editor` module; nothing is persisted, so no one-way door and no ADR. No new dependencies.

- **Catalog** — Item types with a name and real size (width × height × depth, feet), each flagged `placeholder` until the owner gives a product model. Typical sizes for now:

  | Item type  | Size                                              | Source                                   |
  | ---------- | ------------------------------------------------- | ---------------------------------------- |
  | TV stand   | 8 ft × 1.5 ft × 1 ft, two doors                   | owner's sketch — not a placeholder       |
  | TV 55″     | 48.4 × 27.9 in panel, 2 in deep, 3 in feet        | typical 55″, placeholder                 |
  | TV 65″     | 57.0 × 32.7 in panel, 2 in deep, 3 in feet        | typical 65″, placeholder                 |
  | PS5        | 3.8 in wide × 14.1 in high × 8.5 in deep, upright | PS5 slim, placeholder                    |
  | Soundbar   | 2.5 ft × 2.6 in × 4 in                            | typical, placeholder                     |
  | Slat panel | slats 1 in wide, ½ in gaps, ¾ in deep overall     | typical acoustic slat panel, placeholder |

- **Starter arrangement** — the fixed Items of the TV wall, computed from the Room and a chosen TV size (55 or 65): stand centred on the TV wall, hung 6 in above the floor (top at 2 ft); TV centred on the stand on its feet, set back; soundbar centred in front of the TV; PS5 upright on the stand, 1 ft in from its left (west) end.
- TV size is app state (default 55), switchable from the Header and by `?tv=55|65` so Views and screenshots are reproducible.

These are furniture sizes, not Room measurements, so `docs/room-spec.md` "Measured values" gets no new rows.

## Testing seams

Unit (Vitest, `src/editor`):

- `tvWallItems(room, tvSize)` — positions and sizes of each Item; stand centred and 6 in off the floor; TV and PS5 resting on the stand top; everything standing off the Slat panel face.
- `itemsIntersect` / inside-Room check over the starter arrangement for both TV sizes; Door swing clear.
- `slatPanelSlats(room)` — slat count and positions across the TV wall; `slatPanelCutouts(room)` — one cut-out per TV-wall Fitting.

E2E (Playwright, `window.__ASHERA__`): new `items` (type id + size + position per Item drawn) and `tvSize`. The Header TV button flips `tvSize` and the TV's size; `?tv=65` loads 65″; no console errors; draw calls < 100.

Visual (`@visual`): existing per-View baselines updated each slice via the `update-snapshots` workflow; one extra `overview` baseline at `?tv=65`.

## Done when

All must pass:

- [ ] `npm run verify` prints ALL GREEN
- [ ] `window.__ASHERA__.items` lists the TV stand, TV, PS5 and soundbar with the Catalog sizes above, and unit tests prove none intersects another, leaves the Room or enters the Door swing (both TV sizes)
- [x] The stand's underside is 0.5 ft and its top 2 ft above the floor, centred on the TV wall (unit test)
- [x] The Header TV button switches `window.__ASHERA__.tvSize` between 55 and 65 and the drawn TV's width changes to match; `?tv=65` loads 65″ (e2e)
- [ ] The Slat panel covers the whole TV wall with a cut-out per TV-wall Fitting (unit test); draw calls in `overview` stay < 100 (e2e)
- [ ] No new Room measurements, so no new "Measured values" rows (stated in the log entry)
- [ ] Owner said "looks good" on before/after screenshots of every View, plus `overview` at 65″
- [ ] docs updated (architecture: editor module now live; GLOSSARY if new terms), `docs/log.md` entry added

## Slices

1. **Tracer: the TV stand.** Catalog with the stand, starter arrangement with one Item, drawn in the scene, listed in `__ASHERA__.items`. — _you'll see: the black floating stand with two doors centred on the TV wall, in the overview and entrance Views._
2. **TV and the size switch.** TV 55″/65″ on the stand, Header button, `?tv=`. — _you'll see: the TV standing on the stand with a dark screen and faint edge, and one click swaps 55″ for 65″ in every View._
3. **PS5 and soundbar.** — _you'll see: the PS5 upright on the left of the stand and the soundbar in front of the TV, as in your picture._
4. **Slat panel.** Instanced slats over the whole TV wall with Fitting cut-outs; Items move forward to stand off it. — _you'll see: the TV wall covered in black vertical slats from floor to ceiling, the data plate still showing through._

## Open questions

- Product models for the TV, PS5 (slim, original or Pro), soundbar and Slat panel — typical sizes are placeholders until then.
- With the 65″ TV the screen top reaches about 5 ft, roughly where the data plate is (4.3 ft along the wall, 5 ft high, a placeholder position): it may end up just behind the screen. The low socket sits behind the stand.
