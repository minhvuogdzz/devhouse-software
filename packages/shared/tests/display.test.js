import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DISPLAY,
  makeDisplay,
  normalizeDisplay,
  slidePageCount,
} from '../src/utils/display.js';

describe('normalizeDisplay', () => {
  it('fills everything in from the defaults', () => {
    expect(normalizeDisplay(undefined)).toEqual(DEFAULT_DISPLAY);
    expect(normalizeDisplay(null)).toEqual(DEFAULT_DISPLAY);
    expect(normalizeDisplay('nonsense')).toEqual(DEFAULT_DISPLAY);
  });

  it('keeps valid choices and ignores invalid ones', () => {
    const result = normalizeDisplay({
      layout: 'slide',
      columns: { mobile: 2, tablet: 99, desktop: 'x' },
      showMore: { enabled: false, type: 'invalidType', maxRows: 99 },
      slide: { motion: 'teleport', autoplay: false, interval: 1, dots: 'progress', arrows: 'yes' },
    });
    expect(result.layout).toBe('slide');
    expect(result.columns).toEqual({ mobile: 2, tablet: 6, desktop: 3 });
    expect(result.showMore).toEqual({ enabled: false, type: 'expand', maxRows: 10 });
    expect(result.slide).toEqual({
      motion: 'step',
      autoplay: false,
      interval: 2,
      dots: 'progress',
      arrows: true,
    });
    expect(normalizeDisplay({ layout: 'carousel' }).layout).toBe('grid');
  });

  it('uses the list own defaults for whatever the admin has not changed', () => {
    const own = makeDisplay({
      layout: 'slide',
      columns: { mobile: 2, tablet: 3, desktop: 5 },
      showMore: { enabled: true, type: 'loadMore', maxRows: 3 },
    });
    const result = normalizeDisplay({ columns: { desktop: 4 } }, own);
    expect(result.layout).toBe('slide');
    expect(result.columns).toEqual({ mobile: 2, tablet: 3, desktop: 4 });
    expect(result.showMore).toEqual({ enabled: true, type: 'loadMore', maxRows: 3 });
  });

  it('never changes the shared default', () => {
    normalizeDisplay({ layout: 'list', columns: { mobile: 5 } });
    expect(DEFAULT_DISPLAY.layout).toBe('grid');
    expect(DEFAULT_DISPLAY.columns.mobile).toBe(1);
    expect(DEFAULT_DISPLAY.showMore.maxRows).toBe(2);
  });
});

describe('slidePageCount', () => {
  it('counts the pages a slider needs', () => {
    expect(slidePageCount(10, 5)).toBe(2);
    expect(slidePageCount(11, 5)).toBe(3);
    expect(slidePageCount(3, 5)).toBe(1);
    expect(slidePageCount(0, 3)).toBe(1);
    expect(slidePageCount(4, 0)).toBe(4);
  });
});
