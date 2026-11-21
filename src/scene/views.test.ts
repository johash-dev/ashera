import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW, VIEWS, viewFromSearch } from './views';

describe('viewFromSearch', () => {
  it('returns the requested preset', () => {
    expect(viewFromSearch('?view=top')).toBe(VIEWS.top);
  });

  it('falls back to the default for missing or unknown views', () => {
    expect(viewFromSearch('')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch('?view=nope')).toBe(VIEWS[DEFAULT_VIEW]);
    expect(viewFromSearch('?view=toString')).toBe(VIEWS[DEFAULT_VIEW]);
  });
});
