---
status: accepted
date: 2026-11-21
---

# 0001 — Units and coordinate system

## Context

All room measurements were taken in feet. Every module (room, editor, scene, persistence) must agree on units and axes; changing them later would touch every saved Layout and every position in the code.

## Decision

- **Units:** feet, everywhere — config, geometry, scene and saved Layouts. 1 three.js unit = 1 ft.
- **Origin:** centre of the floor.
- **Axes:** +x east, +y up, +z south (so the north/window wall is at −z). Right-handed, three.js default up.
- **Walls** run clockwise viewed from above (north NW→NE, east NE→SE, south SE→SW, west SW→NW); an opening's `offset` is measured from its wall's start corner.

## Consequences

- No unit conversion anywhere; numbers in code read like the tape measure.
- Imported 3D models authored in metres must be scaled by 3.2808 at load time.
- Changing this is a one-way door: it would require migrating saved Layouts.
