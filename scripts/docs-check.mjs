#!/usr/bin/env node
/**
 * Deterministic docs integrity check (the model-based contradiction pass lives in the
 * /docs-check skill). Fails when:
 *   1. a relative markdown link points to a file that doesn't exist
 *   2. a doc under docs/ (or a root doc) is not listed in docs/index.md
 *   3. a doc that needs front matter (docs/*.md, adr, specs) has no `status:`
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.scratch',
  'reference',
  'playwright-report',
  'test-results',
]);
const ROOT_DOCS = ['CLAUDE.md', 'GLOSSARY.md', 'CODING_STANDARDS.md'];
const NO_FRONT_MATTER = new Set(['docs/index.md', 'docs/log.md']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

const rel = (p) => relative(root, p).split(sep).join('/');
const problems = [];

const markdownFiles = [
  ...ROOT_DOCS.map((f) => join(root, f)).filter(existsSync),
  ...walk(join(root, 'docs')),
  ...(existsSync(join(root, '.claude')) ? walk(join(root, '.claude')) : []),
  ...(existsSync(join(root, '.github')) ? walk(join(root, '.github')) : []),
];

// 1. Broken relative links (ignores links inside fenced code blocks).
const linkPattern = /\[[^\]]*\]\(([^)\s]+)\)/g;
for (const file of markdownFiles) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, target] of text.matchAll(linkPattern)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    if (!path) continue;
    if (!existsSync(resolve(dirname(file), path))) problems.push(`${rel(file)}: broken link → ${target}`);
  }
}

// 2. Index coverage.
const indexPath = join(root, 'docs/index.md');
const indexText = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';
const indexed = new Set(
  [...indexText.matchAll(linkPattern)].map(([, t]) => rel(resolve(dirname(indexPath), t.split('#')[0]))),
);
const mustBeIndexed = markdownFiles
  .map(rel)
  .filter((p) => (p.startsWith('docs/') || ROOT_DOCS.includes(p)) && p !== 'docs/index.md');
for (const p of mustBeIndexed) {
  if (!indexed.has(p)) problems.push(`docs/index.md: missing entry for ${p}`);
}

// 3. Front matter status.
for (const p of mustBeIndexed.filter((p) => p.startsWith('docs/') && !NO_FRONT_MATTER.has(p))) {
  const text = readFileSync(join(root, p), 'utf8');
  if (!/^---\r?\n[\s\S]*?^status:\s*\S+/m.test(text))
    problems.push(`${p}: front matter needs a status field`);
}

if (problems.length) {
  console.error(`docs-check: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`docs-check: ${markdownFiles.length} markdown files OK`);
