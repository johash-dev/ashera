---
status: active
updated: 2026-11-21
---

# Testing

`npm run verify` runs everything below and prints `ALL GREEN` only on full success. That is the definition of done.

## What goes where

| Kind             | Tool       | Location               | Use for                                                                              |
| ---------------- | ---------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Unit             | Vitest     | `src/**/*.test.ts`     | Pure logic: geometry, room invariants, placement, snapping, collision, serialization |
| E2E              | Playwright | `e2e/*.spec.ts`        | App boots, no console errors, Views, editor flows (place/move/rotate/save/load)      |
| Visual (@visual) | Playwright | tagged tests in `e2e/` | Screenshots of preset Views compared to baselines                                    |

## Rules

- Test behaviour through public interfaces. A rename with no behaviour change must not break tests.
- TDD for pure logic: one failing test → make it pass → refactor; repeat. Never write all tests first.
- A bug fix starts with a failing test that reproduces it.
- Never edit a test just to make it pass — if the test is wrong, say so explicitly in the PR.
- E2E reads state via `window.__ASHERA__` (dev only) instead of pixels; use `?view=` for fixed cameras.

## Visual snapshots

WebGL output differs between Windows and Linux, so baselines are **Linux-only**, stored in `e2e/__screenshots__/`, and compared **in CI**.

- Locally `npm run verify` skips `@visual` tests (`test:e2e:local`). Take evidence screenshots in the browser instead and attach them to the PR.
- When a visual change is intended: run the **update-snapshots** GitHub workflow on the PR branch; it regenerates baselines, commits them, and starts CI on the branch. Review the image diff in the PR.
- A failing visual test in CI with no intended visual change = regression.

## Pre-commit

Husky runs lint-staged (eslint + prettier on staged files), typecheck and unit tests. A red commit is blocked; fix the cause, never bypass with `--no-verify`.
