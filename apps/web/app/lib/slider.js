import { slidePageCount } from '@devhouse/shared';

/**
 * Small pure helpers for the slider, kept apart so they can be tested without a browser.
 * `m` is what the slider measured: { perView, stride, maxScroll, pages }
 *   perView    how many items are visible at once
 *   stride     width of one item plus the gap, in pixels
 *   maxScroll  the furthest the row can be scrolled, in pixels
 */

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Which page is showing for a scroll position. The last page counts once the row is at its end. */
export function pageFromScroll(scrollLeft, m) {
  if (m.pages <= 1) return 0;
  if (m.maxScroll > 0 && scrollLeft >= m.maxScroll - 2) return m.pages - 1;
  return clamp(Math.round(scrollLeft / (m.stride * m.perView)), 0, m.pages - 1);
}

/** Where to scroll to show a page. The last page may be shorter, so it stops at the end of the row. */
export function scrollLeftForPage(page, m) {
  return Math.min(Math.max(0, page) * m.perView * m.stride, m.maxScroll);
}

/** Moves forward or back by `delta` pages and wraps around at either end. */
export function wrapPage(page, delta, pages) {
  if (pages <= 0) return 0;
  return (((page + delta) % pages) + pages) % pages;
}

/**
 * Repeats the items until there are at least `minCount`, so a ticker that runs without stopping
 * never shows a gap. Returns the items in order, repeated as a whole.
 */
export function repeatToFill(items, minCount) {
  if (items.length === 0) return [];
  const copies = Math.max(1, Math.ceil(minCount / items.length));
  return Array.from({ length: copies }, () => items).flat();
}

export { slidePageCount };
