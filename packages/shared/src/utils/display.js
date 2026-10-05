/**
 * How a list of items is shown on the website. An admin picks this for every list:
 *   layout   grid, list (one item per row) or slide
 *   columns  how many items are visible at once on a phone, a tablet and a computer
 *   slide    only for layout "slide":
 *              motion    "step" moves one page at a time (with dots), "smooth" runs non-stop
 *              autoplay  moves by itself
 *              interval  seconds between two moves ("step"), or seconds each item takes to pass ("smooth")
 *              dots      none, dot, progress (a bar that fills up) or slide (a pill that glides)
 *              arrows    previous and next buttons
 */
export const DISPLAY_LAYOUTS = ['grid', 'list', 'slide'];
export const SLIDE_MOTIONS = ['step', 'smooth'];
export const DOT_STYLES = ['none', 'dot', 'progress', 'slide'];
export const DISPLAY_MAX_COLUMNS = 6;
export const SLIDE_INTERVAL_MIN = 2;
export const SLIDE_INTERVAL_MAX = 20;

export const DEFAULT_DISPLAY = Object.freeze({
  layout: 'grid',
  columns: Object.freeze({ mobile: 1, tablet: 2, desktop: 3 }),
  slide: Object.freeze({
    motion: 'step',
    autoplay: true,
    interval: 4,
    dots: 'dot',
    arrows: true,
  }),
});

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const bool = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

function whole(value, min, max, fallback) {
  const number = Number(value);
  if (value === null || value === '' || !Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

/**
 * A complete, safe display setting. Anything missing or out of range falls back to `fallback`
 * (the built-in default unless the list has its own).
 */
export function normalizeDisplay(input, fallback = DEFAULT_DISPLAY) {
  const base = fallback === DEFAULT_DISPLAY ? DEFAULT_DISPLAY : normalizeDisplay(fallback);
  const source = isObject(input) ? input : {};
  const columns = isObject(source.columns) ? source.columns : {};
  const slide = isObject(source.slide) ? source.slide : {};

  return {
    layout: pick(source.layout, DISPLAY_LAYOUTS, base.layout),
    columns: {
      mobile: whole(columns.mobile, 1, DISPLAY_MAX_COLUMNS, base.columns.mobile),
      tablet: whole(columns.tablet, 1, DISPLAY_MAX_COLUMNS, base.columns.tablet),
      desktop: whole(columns.desktop, 1, DISPLAY_MAX_COLUMNS, base.columns.desktop),
    },
    slide: {
      motion: pick(slide.motion, SLIDE_MOTIONS, base.slide.motion),
      autoplay: bool(slide.autoplay, base.slide.autoplay),
      interval: whole(slide.interval, SLIDE_INTERVAL_MIN, SLIDE_INTERVAL_MAX, base.slide.interval),
      dots: pick(slide.dots, DOT_STYLES, base.slide.dots),
      arrows: bool(slide.arrows, base.slide.arrows),
    },
  };
}

/** The default display of one list, written the short way: makeDisplay({ layout: 'slide' }). */
export const makeDisplay = (partial = {}) => normalizeDisplay(partial);

/** How many pages a slider has when `perView` items are visible at once. */
export const slidePageCount = (itemCount, perView) =>
  Math.max(1, Math.ceil(Math.max(0, itemCount) / Math.max(1, perView)));
