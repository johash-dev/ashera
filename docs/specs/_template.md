---
status: draft # draft | approved | in-progress | done | superseded
updated: YYYY-MM-DD
phase: 1
---

# <Feature name>

## Goal

One or two sentences: what Asher (or the Owner) can do afterwards that they can't now.

## User stories

- As Asher, I can … so that …

## Invariants

Rules that must always hold (e.g. "Items never intersect walls", "all lengths in feet").

## Out of scope

What this feature deliberately does not do.

## Data model

New or changed types, using GLOSSARY.md terms. Flag any one-way door (persisted schema, coordinates, dependencies) → needs an ADR.

## Testing seams

Which pure functions get unit tests; which e2e checks (`window.__ASHERA__` fields, Views) and visual snapshots prove it works.

## Done when

All must pass:

- [ ] `npm run verify` prints ALL GREEN
- [ ] <specific, checkable outcome>
- [ ] <specific, checkable outcome>
- [ ] Every new real-world dimension has a row in `docs/room-spec.md` "Measured values" (checked by `src/room/measurements.test.ts`)
- [ ] Owner said "looks good" on before/after screenshots of every affected View
- [ ] docs updated, `docs/log.md` entry added

## Slices

Vertical, each shippable as its own PR. Slice 1 is the tracer bullet — thinnest end-to-end path. Each slice ends with what the owner will see.

1. … — _you'll see: <one plain sentence, which View>_
2. … — _you'll see: …_

## Open questions

- …
