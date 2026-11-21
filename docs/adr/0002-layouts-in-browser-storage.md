---
status: accepted
date: 2026-11-21
---

# 0002 — Layouts saved in browser storage with JSON export

## Context

Asher uses ASHERA only on his PC. Layouts must survive reloads, and losing them would be painful, but there is no need for sync across devices or users.

## Decision

- Save Layouts in the browser (localStorage, or IndexedDB if size demands it) on Asher's PC.
- Provide JSON export/import as backup and for moving between browsers.
- Every saved Layout carries a `schemaVersion`; loading migrates older versions forward.

## Consequences

- No backend, accounts or hosting cost.
- Clearing browser data loses Layouts not exported — the UI should make export easy and visible.
- The Layout schema is a one-way door: changes need a migration and an ADR.
