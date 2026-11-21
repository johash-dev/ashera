import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { expect, test } from '@playwright/test';

// Regression: with Playwright's default per-pixel threshold (0.2) these two scene colours compare
// as identical, so @visual tests passed after the whole room changed. See docs/testing.md.
const SCENE_BACKGROUND = '#0b0b10';
const DARK_WALL = '#15161c';

const swatch = (color: string) => `<body style="margin:0;height:100vh;background:${color}"></body>`;

test('visual comparison catches a dark-on-dark change', async ({ page }, testInfo) => {
  const name = 'dark-on-dark.png';
  const baseline = testInfo.snapshotPath(name, { kind: 'screenshot' });

  // Solid colours render identically on every OS, so this baseline is written on the fly
  // and removed afterwards; it never lands in e2e/__screenshots__.
  await page.setContent(swatch(SCENE_BACKGROUND));
  await mkdir(dirname(baseline), { recursive: true });
  await writeFile(baseline, await page.screenshot());
  try {
    await expect(page).toHaveScreenshot(name); // control: unchanged colour matches

    await page.setContent(swatch(DARK_WALL));
    await expect(expect(page).toHaveScreenshot(name, { timeout: 1_000 })).rejects.toThrow();
  } finally {
    await rm(dirname(baseline), { recursive: true, force: true });
  }
});
