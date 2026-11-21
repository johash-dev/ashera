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

### Comparison tolerance

`playwright.config.ts` sets two knobs on `toHaveScreenshot`:

- `threshold: 0.02` — how far apart (YIQ colour distance, 0–1) two pixels may be and still count as equal. Playwright's default, 0.2, is far too loose for a dark scene: the background `#0b0b10` and a dark wall `#15161c` are only ~0.04 apart, so a whole-room change passed as "unchanged".
- `maxDiffPixelRatio: 0.01` — how many pixels may differ. This absorbs rendering noise between machines.

Measured on 2026-11-21 (old wireframe baselines vs. the solid-wall scene of `feat/empty-room-twin-1`, rendered on Linux in the Playwright container; % of pixels different):

| Comparison                               | t=0   | 0.02  | 0.05  | 0.1   | 0.2   |
| ---------------------------------------- | ----- | ----- | ----- | ----- | ----- |
| Real scene change, overview              | 15.0% | 15.0% | 9.0%  | 0.58% | 0.26% |
| Real scene change, top                   | 17.6% | 15.2% | 14.5% | 2.43% | 0.74% |
| Same scene, container vs. CI runner      | 0.12% | 0.12% | 0.11% | 0.10% | 0.09% |
| Same scene, two runs on the same machine | 0     | 0     | 0     | 0     | 0     |

Noise barely depends on `threshold` (it is a few high-contrast pixels, absorbed by `maxDiffPixelRatio`), while the real change mostly vanishes above ~0.05. `e2e/visual-threshold.spec.ts` guards this: it fails if the config stops catching a dark-on-dark change.

The update-snapshots workflow runs `--update-snapshots=all`, so every baseline is rewritten, not only those that fail the comparison.

## Pre-commit

Husky runs lint-staged (eslint + prettier on staged files), typecheck and unit tests. A red commit is blocked; fix the cause, never bypass with `--no-verify`.
