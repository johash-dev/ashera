---
status: accepted
date: 2026-11-21
---

# 0003 — No backend until a phase needs one

## Context

The generic concept draft proposed device abstractions, a control layer and multi-room support up front. For one room and one user, these add maintenance with no benefit in Phases 1–3.

## Decision

ASHERA stays a static front-end app through Phases 1–3. A backend or integration layer is introduced only in Phase 4, after hardware is chosen — most likely by talking to Home Assistant rather than to devices directly.

## Consequences

- Fewer moving parts; the app can be served as static files.
- Phase 4 will need its own ADR covering the hub, authentication and how the Twin maps Items to Devices.
