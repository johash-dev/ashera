# Docs index

Read this first. Every doc in the repo is listed here with one line; `npm run docs-check` fails if one is missing.

## Start here

- [CLAUDE.md](../CLAUDE.md) — how to work in this repo (commands, rules, workflow)
- [GLOSSARY.md](../GLOSSARY.md) — domain vocabulary
- [CODING_STANDARDS.md](../CODING_STANDARDS.md) — review baseline, numbered rules

## Product

- [concept.md](concept.md) — vision, decisions, phases, brand
- [room-spec.md](room-spec.md) — where the measurements came from and what is still unmeasured

## Engineering

- [architecture.md](architecture.md) — modules, boundaries, data flow, coordinates
- [r3f.md](r3f.md) — React Three Fiber rendering and performance rules
- [testing.md](testing.md) — test kinds, TDD rules, visual snapshot process

## Decisions (ADRs)

Only for hard-to-reverse, surprising decisions with a real trade-off.

- [0001 — Units and coordinate system](adr/0001-units-and-coordinates.md)
- [0002 — Layouts in browser storage with JSON export](adr/0002-layouts-in-browser-storage.md)
- [0003 — No backend until a phase needs one](adr/0003-no-backend-until-needed.md)
- [0004 — The owner approves intent and the look; the agent does the engineering](adr/0004-owner-approval-model.md)

## Specs

One per feature, from [the template](specs/_template.md).

- [empty-room-twin](specs/empty-room-twin.md) — Phase 1: the empty Room built from config, Cutaway, Door, Fittings, dark look, photo Views
- [tv-wall](specs/tv-wall.md) — Phase 2 first feature: TV stand, TV 55″/65″ switch, PS5, soundbar and Slat panel at real size, fixed in place
- [desk-and-sofa](specs/desk-and-sofa.md) — roadmap feature 1: desk with PC setup, gaming chair, compact/L-shaped sofa switch and rug, fixed in place
- [wall-decor](specs/wall-decor.md) — roadmap feature 2: pegboard with headphones and shelf above the desk, three picture frames above the sofa, fixed in place
- [object-detail](specs/object-detail.md) — detail pass: shapes, materials and small details for every existing Item, one group per slice
- [real-colours](specs/real-colours.md) — real room colours: white floor and walls, grey PC wall, black desk and TV, charcoal sofa

- [photoreal-pass](specs/photoreal-pass.md) — draft, Phase 3: game-engine diorama look (live light rig, soft shadows, glow, bevels), not photoreal

## History

- [log.md](log.md) — append-only work log

## Reference (immutable)

- [reference/](reference/) — room photos, hand sketch, top-view floor plan
