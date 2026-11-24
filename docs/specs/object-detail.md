---
status: done # draft | approved | in-progress | done | superseded
updated: 2026-11-25
phase: 2
---

# Object detail pass

## Goal

Every Item already in the Twin looks like the real thing — shapes, materials and small details in the dark, premium style — so Asher can judge the room's feel before buying more. Done before Surround sound (roadmap feature 3).

## User stories

- As Asher, I see the desk setup, TV wall, sofas and rug, and wall décor with recognisable detail (legs, cushions, stand feet, keys…) in every View that shows them.
- As Asher, I see the same sizes and spots as before: this pass changes how things look, not where they are or how big.
- As the Owner, I approve one group at a time from before/after screenshots and can ask for changes per group.

## Invariants

- Sizes, positions and Catalog entries do not change: every Item keeps its Catalog size and its starter-arrangement spot. Detail stays inside each Item's own box.
- All sizes in feet (ADR 0001); no dimension hard-coded outside the Catalog or `room.config.ts`.
- Draw calls stay under the e2e budget (< 100) in every View, with either sofa and either TV size. Today the Views use 48–75, so detail must be cheap: merge or instance repeated parts.
- The dark look stays: one restrained accent colour, no bright surfaces.
- Placeholder art and "typical" sizes stay flagged as before.

## Out of scope

Real sizes or product models; moving Items; real pictures in the frames; lighting (LED strips, the glow under the TV stand); drawing the pegboard's individual holes unless a slice says so; new Items; speakers.

## Data model

None. Drawing only, in `scene`; the Catalog and starter arrangement are untouched. No persisted data, dependencies or coordinates change, so no one-way door and no ADR.

## Testing seams

Unit (Vitest): the pure box-builder functions in `scene` (`itemBoxes`, like `sofaBoxes`) get tests per Item type: every part lies within the Item's size box, and the part count stays within a stated cap. Existing editor tests (inside Room, no overlap, Door swing) must stay green unchanged.

E2E (Playwright): `window.__ASHERA__.items` unchanged (same types, sizes, centres, facing); no console errors; draw calls < 100 in every View, with `?sofa=l` and both TV sizes.

Visual (`@visual`): baselines updated per slice via the `update-snapshots` workflow; before/after screenshots of every View on each Approval card.

## Done when

All must pass:

- [x] `npm run verify` prints ALL GREEN
- [x] `__ASHERA__.items` is identical to before this spec (types, sizes, centres, facing) — e2e
- [x] Unit tests show every drawn part of every Item stays within that Item's size box
- [x] Draw calls < 100 in every View, both sofas, both TV sizes (e2e)
- [x] Each group below has visible detail the Owner approved (slices 1–4)
- [x] No new Room measurements, so no new "Measured values" rows (stated in the log entry)
- [x] Owner said "looks good" on before/after screenshots of every affected View, per slice
- [x] docs updated, `docs/log.md` entry added

## Slices

Vertical, each its own PR with before/after screenshots. Slice 1 is the tracer: it also settles how detail is built cheaply for the rest.

1. **Desk setup** — desk, monitor, PC tower, keyboard, mouse, gaming chair. — _you'll see: a desk with legs and a stand-mounted monitor, a PC tower with vents and a lit strip, keys on the keyboard and a chair with seat, back, arms and base, in the overview and right-from-entrance Views._
2. **TV wall** — TV, TV stand, PS5, soundbar (the Slat panel was left as it is: already slats on a felt backing; the stand has doors but no shelves). — _you'll see: a TV with a thin bezel and stand feet, a TV stand with doors and shelves, a recognisable PS5 and soundbar, in the overview and entrance Views._
3. **Sofa and rug** — compact sofa, L-shaped sofa, rug. — _you'll see: sofas with seat and back cushions, arms and feet, and a rug with a subtle border, in the overview and window Views, with both sofas._
4. **Wall décor** — pegboard, headphones, shelf, frames. — _you'll see: a framed pegboard, headphones with a headband and ear pads, a shelf with a lip, and frames with a mat around the art, in the right-from-entrance and overview Views._

## Open questions

- None blocking. Owner gave no reference photos, so each slice uses a good typical look and the owner corrects on the Approval card.
