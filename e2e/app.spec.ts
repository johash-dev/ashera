import { expect, test, type Page } from '@playwright/test';

async function openView(page: Page, view: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(`/?view=${view}`);
  await page.waitForFunction(() => window.__ASHERA__?.ready === true);
  return errors;
}

test('app boots with the room loaded and no console errors', async ({ page }) => {
  const errors = await openView(page, 'overview');
  await expect(page.getByTestId('scene-canvas').locator('canvas')).toBeVisible();
  const state = await page.evaluate(() => window.__ASHERA__);
  expect(state?.room).toEqual({ width: 9, depth: 10, ceilingHeight: 9.5 });
  expect(errors).toEqual([]);
});

test('?view= selects a camera preset', async ({ page }) => {
  await openView(page, 'top');
  await expect(page.getByTestId('view-label')).toHaveText('Top-down plan');
  expect(await page.evaluate(() => window.__ASHERA__?.view)).toBe('top');
});

for (const view of ['overview', 'top']) {
  test(`${view} view matches baseline @visual`, async ({ page }) => {
    await openView(page, view);
    await page.waitForTimeout(500); // let the first frames settle
    await expect(page).toHaveScreenshot(`${view}.png`);
  });
}
