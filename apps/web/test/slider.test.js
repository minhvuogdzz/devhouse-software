import { describe, it, expect } from 'vitest';
import {
  pageFromScroll,
  repeatToFill,
  scrollLeftForPage,
  slidePageCount,
  wrapPage,
} from '../app/lib/slider.js';

// 10 items, 3 visible at once, each 200px wide with a 20px gap: 4 pages
const m = { perView: 3, stride: 220, maxScroll: 10 * 220 - 20 - 3 * 220 + 20, pages: 4 };

describe('slider pages', () => {
  it('counts pages from the items and how many are visible', () => {
    expect(slidePageCount(10, 3)).toBe(4);
    expect(m.pages).toBe(4);
  });

  it('knows which page is showing from the scroll position', () => {
    expect(pageFromScroll(0, m)).toBe(0);
    expect(pageFromScroll(3 * 220, m)).toBe(1);
    expect(pageFromScroll(6 * 220, m)).toBe(2);
    // Near the end of the row it is the last page, even though that page is shorter
    expect(pageFromScroll(m.maxScroll, m)).toBe(3);
    expect(pageFromScroll(m.maxScroll - 1, m)).toBe(3);
    // Between two pages it rounds to the nearer one
    expect(pageFromScroll(3 * 220 - 100, m)).toBe(1);
    expect(pageFromScroll(3 * 220 - 400, m)).toBe(0);
  });

  it('works out where to scroll to for a page, and stops at the end of the row', () => {
    expect(scrollLeftForPage(0, m)).toBe(0);
    expect(scrollLeftForPage(1, m)).toBe(3 * 220);
    expect(scrollLeftForPage(3, m)).toBe(m.maxScroll);
    expect(scrollLeftForPage(-2, m)).toBe(0);
  });

  it('has a single page when everything fits', () => {
    const fits = { perView: 4, stride: 200, maxScroll: 0, pages: 1 };
    expect(pageFromScroll(123, fits)).toBe(0);
    expect(scrollLeftForPage(0, fits)).toBe(0);
  });

  it('wraps around at both ends', () => {
    expect(wrapPage(3, 1, 4)).toBe(0);
    expect(wrapPage(0, -1, 4)).toBe(3);
    expect(wrapPage(1, 1, 4)).toBe(2);
    expect(wrapPage(2, 0, 0)).toBe(0);
  });
});

describe('repeatToFill', () => {
  it('repeats a short list so a ticker never shows a gap', () => {
    expect(repeatToFill(['a', 'b', 'c'], 7)).toEqual(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c']);
    expect(repeatToFill(['a', 'b', 'c'], 3)).toEqual(['a', 'b', 'c']);
    expect(repeatToFill(['a'], 4)).toEqual(['a', 'a', 'a', 'a']);
  });

  it('leaves an empty list empty', () => {
    expect(repeatToFill([], 5)).toEqual([]);
  });
});
