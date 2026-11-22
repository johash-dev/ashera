#!/usr/bin/env node
/**
 * Saves a screenshot of every View from a running dev server, for the Approval card.
 * Usage: node scripts/screenshots.mjs [outDir=.scratch/screens] [baseUrl=http://localhost:5173]
 * Run it on main (before) and on the branch (after) to get a before/after pair.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const VIEWS = ['overview', 'top', 'entrance', 'window', 'left', 'right']; // ViewId in src/scene/views.ts
const [outDir = '.scratch/screens', baseUrl = 'http://localhost:5173'] = process.argv.slice(2);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const view of VIEWS) {
  await page.goto(`${baseUrl}/?view=${view}`);
  await page.waitForFunction(() => globalThis.__ASHERA__?.ready === true);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${view}.png` });
  console.log(`${outDir}/${view}.png`);
}
await browser.close();
