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
  expect(state?.room).toEqual({ width: 10, depth: 9, ceilingHeight: 9.5 });
  expect(errors).toEqual([]);
});

test('?view= selects a camera preset', async ({ page }) => {
  await openView(page, 'top');
  await expect(page.getByTestId('view-label')).toHaveText('Top-down plan');
  expect(await page.evaluate(() => window.__ASHERA__?.view)).toBe('top');
});

test('walls are built around their openings, with beams', async ({ page }) => {
  await openView(page, 'overview');
  const state = await page.evaluate(() => window.__ASHERA__);
  expect(state?.pieces).toEqual({ north: 1, east: 1, south: 2, west: 4 });
  expect(state?.beams).toEqual(['west', 'south', 'east']);
});

test('the door is fixed open at 90 degrees', async ({ page }) => {
  await openView(page, 'overview');
  expect(await page.evaluate(() => window.__ASHERA__?.door)).toEqual({ openAngleDeg: 90 });
});

test('cutaway hides the surfaces facing an outside camera', async ({ page }) => {
  await openView(page, 'overview');
  await page.waitForFunction(() => window.__ASHERA__?.hidden.ceiling === true);
  expect(await page.evaluate(() => window.__ASHERA__?.hidden)).toEqual({
    walls: ['east', 'south'],
    ceiling: true,
  });

  await openView(page, 'top');
  await page.waitForFunction(() => window.__ASHERA__?.hidden.ceiling === true);
  expect(await page.evaluate(() => window.__ASHERA__?.hidden.walls)).toEqual([]);
});

test('cutaway follows the camera while orbiting', async ({ page }) => {
  await openView(page, 'overview');
  await page.waitForFunction(() => window.__ASHERA__?.hidden.ceiling === true);
  const canvas = page.getByTestId('scene-canvas').locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 400, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(() => page.evaluate(() => window.__ASHERA__?.hidden.walls))
    .not.toEqual(['east', 'south']);
});

for (const view of ['overview', 'top']) {
  test(`${view} view matches baseline @visual`, async ({ page }) => {
    await openView(page, view);
    await page.waitForTimeout(500); // let the first frames settle
    await expect(page).toHaveScreenshot(`${view}.png`);
  });
}
