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

test('all five fittings are drawn', async ({ page }) => {
  await openView(page, 'overview');
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.fittings)).toBe(5);
});

const VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'top', label: 'Top-down plan' },
  { id: 'entrance', label: 'Entrance' },
  { id: 'window', label: 'Window' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
];

for (const { id, label } of VIEWS) {
  test(`?view=${id} loads the ${label} View with no console errors`, async ({ page }) => {
    const errors = await openView(page, id);
    await expect(page.getByTestId('view-label')).toHaveText(label);
    expect(await page.evaluate(() => window.__ASHERA__?.view)).toBe(id);
    await expect.poll(() => page.evaluate(() => window.__ASHERA__?.drawCalls)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
}

test('each View button switches the View and the Header label', async ({ page }) => {
  const errors = await openView(page, 'overview');
  for (const { id, label } of [...VIEWS].reverse()) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByTestId('view-label')).toHaveText(label);
    expect(await page.evaluate(() => window.__ASHERA__?.view)).toBe(id);
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  expect(errors).toEqual([]);
});

test('the photo Views stand inside the Room, so Cutaway hides nothing', async ({ page }) => {
  await openView(page, 'overview');
  await page.getByRole('button', { name: 'Window', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__ASHERA__?.hidden))
    .toEqual({ walls: [], ceiling: false });
});

test('the scene stays within the draw-call budget', async ({ page }) => {
  const errors = await openView(page, 'overview');
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.drawCalls)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__ASHERA__?.drawCalls)).toBeLessThan(100);
  expect(errors).toEqual([]);
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

for (const view of ['overview', 'top', 'entrance', 'window', 'left', 'right']) {
  test(`${view} view matches baseline @visual`, async ({ page }) => {
    await openView(page, view);
    await page.waitForTimeout(500); // let the first frames settle
    await expect(page).toHaveScreenshot(`${view}.png`);
  });
}
