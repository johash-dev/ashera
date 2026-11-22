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

test('the TV stand is drawn at its real size, hung on the TV wall, with the 55″ TV, PS5 and soundbar on it', async ({
  page,
}) => {
  await openView(page, 'overview');
  const items = await page.evaluate(() => window.__ASHERA__?.items);
  expect(items?.map((item) => item.type)).toEqual([
    'tv-stand',
    'tv-55',
    'ps5',
    'soundbar',
    'desk',
    'monitor',
    'pc-tower',
    'keyboard',
    'mouse',
    'gaming-chair',
    'sofa-compact',
    'rug',
    'pegboard',
  ]);
  expect(items?.[0]).toEqual({
    type: 'tv-stand',
    size: [8, 1.5, 1],
    position: [0, 1.25, -3.9375], // back on the ¾ in Slat panel face
    facing: 'south',
  });
  expect(items?.[1]?.size[0]).toBeCloseTo(48.4 / 12);
  expect(items?.[2]?.size[1]).toBeCloseTo(14.1 / 12); // PS5 upright
  expect(items?.[3]?.size[0]).toBe(2.5); // soundbar
  expect(await page.evaluate(() => window.__ASHERA__?.tvSize)).toBe(55);
});

test('the desk stands against the east wall, facing west, between the TV stand and the Door', async ({
  page,
}) => {
  await openView(page, 'right');
  const desk = await page.evaluate(() => window.__ASHERA__?.items.find((item) => item.type === 'desk'));
  // 2 ft deep off the east wall (x = 5), its 4 ft run starting at the TV stand's front (z = -3.4375).
  expect(desk).toEqual({ type: 'desk', size: [4, 2.5, 2], position: [4, 1.25, -1.4375], facing: 'west' });
});

test('the pegboard hangs on the east wall above the desk, facing west', async ({ page }) => {
  await openView(page, 'right');
  const board = await page.evaluate(() => window.__ASHERA__?.items.find((item) => item.type === 'pegboard'));
  // 4 × 2 ft, 1 in deep off the east wall (x = 5), centred on the desk (z = -1.4375), bottom edge 4½ ft up.
  expect(board?.size).toEqual([4, 2, 1 / 12]);
  expect(board?.position[0]).toBeCloseTo(5 - 1 / 24);
  expect(board?.position[1]).toBeCloseTo(5.5);
  expect(board?.position[2]).toBeCloseTo(-1.4375);
  expect(board?.facing).toBe('west');
});

const tvWidth = (page: Page) =>
  page.evaluate(
    () => window.__ASHERA__?.items.find((item) => item.type === 'tv-55' || item.type === 'tv-65')?.size[0],
  );

test('the Header TV button switches the TV between 55″ and 65″', async ({ page }) => {
  const errors = await openView(page, 'overview');
  const button = page.getByTestId('tv-size');
  await expect(button).toHaveText('TV 55″');
  await button.click();
  await expect(button).toHaveText('TV 65″');
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.tvSize)).toBe(65);
  expect(await tvWidth(page)).toBeCloseTo(57 / 12);
  await button.click();
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.tvSize)).toBe(55);
  expect(await tvWidth(page)).toBeCloseTo(48.4 / 12);
  expect(errors).toEqual([]);
});

test('?tv=65 loads the 65″ TV', async ({ page }) => {
  await page.goto('/?view=overview&tv=65');
  await page.waitForFunction(() => window.__ASHERA__?.ready === true);
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.tvSize)).toBe(65);
  await expect(page.getByTestId('tv-size')).toHaveText('TV 65″');
  expect(await tvWidth(page)).toBeCloseTo(57 / 12);
});

const sofaTypes = (page: Page) =>
  page.evaluate(() =>
    window.__ASHERA__?.items.map((item) => item.type).filter((type) => type.startsWith('sofa')),
  );

test('the Header sofa button switches between the compact sofa and the L-shaped sofa', async ({ page }) => {
  const errors = await openView(page, 'overview');
  const button = page.getByTestId('sofa-choice');
  await expect(button).toHaveText('Sofa: compact');
  expect(await sofaTypes(page)).toEqual(['sofa-compact']);
  await button.click();
  await expect(button).toHaveText('Sofa: L-shaped');
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.sofa)).toBe('l');
  expect(await sofaTypes(page)).toEqual(['sofa-l-long', 'sofa-l-short']);
  await button.click();
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.sofa)).toBe('compact');
  expect(await sofaTypes(page)).toEqual(['sofa-compact']);
  expect(errors).toEqual([]);
});

test('?sofa=l loads the L-shaped sofa', async ({ page }) => {
  await page.goto('/?view=overview&sofa=l');
  await page.waitForFunction(() => window.__ASHERA__?.ready === true);
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.sofa)).toBe('l');
  await expect(page.getByTestId('sofa-choice')).toHaveText('Sofa: L-shaped');
  expect(await sofaTypes(page)).toEqual(['sofa-l-long', 'sofa-l-short']);
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

test('switching View keeps the room facts, such as the drawn fittings', async ({ page }) => {
  await openView(page, 'overview');
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.fittings)).toBe(5);
  await page.getByRole('button', { name: 'Window', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__ASHERA__?.view)).toBe('window');
  expect(await page.evaluate(() => window.__ASHERA__?.fittings)).toBe(5);
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
  await page.waitForFunction(() => window.__ASHERA__?.hidden?.ceiling === true);
  expect(await page.evaluate(() => window.__ASHERA__?.hidden)).toEqual({
    walls: ['east', 'south'],
    ceiling: true,
  });

  await openView(page, 'top');
  await page.waitForFunction(() => window.__ASHERA__?.hidden?.ceiling === true);
  expect(await page.evaluate(() => window.__ASHERA__?.hidden?.walls)).toEqual([]);
});

test('cutaway follows the camera while orbiting', async ({ page }) => {
  await openView(page, 'overview');
  await page.waitForFunction(() => window.__ASHERA__?.hidden?.ceiling === true);
  const canvas = page.getByTestId('scene-canvas').locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 400, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(() => page.evaluate(() => window.__ASHERA__?.hidden?.walls))
    .not.toEqual(['east', 'south']);
});

for (const view of ['overview', 'top', 'entrance', 'window', 'left', 'right']) {
  test(`${view} view matches baseline @visual`, async ({ page }) => {
    await openView(page, view);
    await page.waitForTimeout(500); // let the first frames settle
    await expect(page).toHaveScreenshot(`${view}.png`);
  });
}

test('overview with the 65″ TV matches baseline @visual', async ({ page }) => {
  await page.goto('/?view=overview&tv=65');
  await page.waitForFunction(() => window.__ASHERA__?.ready === true);
  await page.waitForTimeout(500); // let the first frames settle
  await expect(page).toHaveScreenshot('overview-tv65.png');
});

test('overview with the L-shaped sofa matches baseline @visual', async ({ page }) => {
  await page.goto('/?view=overview&sofa=l');
  await page.waitForFunction(() => window.__ASHERA__?.ready === true);
  await page.waitForTimeout(500); // let the first frames settle
  await expect(page).toHaveScreenshot('overview-sofa-l.png');
});
