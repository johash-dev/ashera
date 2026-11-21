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

- Locally `npm run verify` skips `@visual` tests (`test:e2e:local`). For the owner's Approval card, `node scripts/screenshots.mjs <outDir>` saves every View from the running dev server (run it on `main` for "before" and on the branch for "after").
- When a visual change is intended, the agent updates baselines itself, no owner click:
  1. `gh workflow run update-snapshots.yml --ref <branch>` — regenerates Linux baselines and uploads them as the `baselines` artifact (it does not commit).
  2. `gh run watch <id>`, then `gh run download <id> -n baselines -D e2e/__screenshots__`.
  3. Commit (`test: update visual snapshot baselines`) and push. A normal push, so CI runs on the PR and attaches the `verify` check.
  4. GitHub's image diff of the changed baselines (Files tab) is the PR's visual evidence; the owner's "looks good" on the Approval card approves it.
- A failing visual test in CI with no intended visual change = regression.

### Integrity check

The first step of CI's `verify` job, `scripts/integrity-check.mjs`, fails a PR that adds `.only`/`.skip`/`.fixme`, has fewer test cases than its base, or touches a gate file (`verify`, Playwright/Vite/ESLint/TS config, workflows, Claude hooks or settings). Only the owner can allow it, by adding the `gate-change` label; git-guard stops the agent from adding it. See docs/adr/0004-owner-approval-model.md.

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
