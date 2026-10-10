import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { normalizeDisplay } from '@devhouse/shared';
import { getLocaleFromUrl, getTranslation } from '../../lib/i18n.js';
import {
  pageFromScroll,
  repeatToFill,
  scrollLeftForPage,
  slidePageCount,
  wrapPage,
} from '../../lib/slider.js';
import { SliderDots } from './SliderDots.jsx';

/**
 * Draws a list of items the way the admin chose for it: as a grid, as a list (one item per row)
 * or as a slide, with the number of columns set for phones, tablets and computers.
 *
 *   renderItem(item, index, { layout })   draws one item; layout is 'grid', 'list' or 'slide'
 *   display                                the setting from the admin (see @devhouse/shared display)
 *   gap                                    'sm' | 'md' | 'lg', the space between items
 *   seeAllHref                             optional link to catalog/index page for showMore type 'link'
 */
export function Collection({
  items = [],
  display,
  fallback,
  renderItem,
  getKey = (item, index) => item?._id || item?.id || item?.slug || index,
  label,
  gap = 'md',
  className = '',
  seeAllHref = null,
}) {
  const config = useMemo(() => normalizeDisplay(display, fallback), [display, fallback]);
  if (!items.length) return null;

  const { layout, columns, slide } = config;
  const gapClass = gap === 'sm' ? 'collection--gap-sm' : gap === 'lg' ? 'collection--gap-lg' : '';
  const classes = `collection ${gapClass} ${className}`.trim();
  const style = {
    '--cols-m': columns.mobile,
    '--cols-t': columns.tablet,
    '--cols-d': columns.desktop,
  };
  const shared = { items, config, renderItem, getKey, label, classes, style, seeAllHref };

  if (layout === 'slide') {
    // A slide that runs without stopping needs to move; if the admin turned moving off, it becomes
    // a normal slide the visitor moves by hand.
    return slide.motion === 'smooth' && slide.autoplay ? (
      <Ticker {...shared} />
    ) : (
      <Slider {...shared} />
    );
  }

  if (layout === 'grid') {
    return <GridCollection {...shared} />;
  }

  return (
    <div className={classes} style={style}>
      <ul className="collection-list" aria-label={label}>
        {items.map((item, index) => (
          <li key={getKey(item, index)}>{renderItem(item, index, { layout })}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Grid layout with optional Show More capping. By default, caps visible items at maxRows (default 2 rows)
 * and displays an interactive button based on admin configuration ('expand', 'loadMore', or 'link').
 */
function GridCollection({
  items,
  config,
  renderItem,
  getKey,
  label,
  classes,
  style,
  seeAllHref,
}) {
  const { columns, showMore } = config;
  const location = useLocation();
  const t = getTranslation(getLocaleFromUrl(location?.pathname || '/'));

  const [activeCols, setActiveCols] = useState(columns.desktop);
  const [expanded, setExpanded] = useState(false);
  const [extraRows, setExtraRows] = useState(0);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1024) setActiveCols(columns.desktop);
      else if (width >= 640) setActiveCols(columns.tablet);
      else setActiveCols(columns.mobile);
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, [columns.desktop, columns.tablet, columns.mobile]);

  useEffect(() => {
    setExpanded(false);
    setExtraRows(0);
  }, [items.length]);

  const enabled = showMore?.enabled ?? true;
  const type = showMore?.type ?? 'expand';
  const maxRows = showMore?.maxRows ?? 2;
  const initialLimit = Math.max(1, activeCols * maxRows);

  let visibleItems = items;
  let remainingCount = 0;
  let isCapped = false;

  if (enabled && items.length > initialLimit) {
    isCapped = true;
    if (type === 'expand') {
      visibleItems = expanded ? items : items.slice(0, initialLimit);
      remainingCount = items.length - initialLimit;
    } else if (type === 'loadMore') {
      const currentLimit = initialLimit + extraRows * activeCols;
      visibleItems = items.slice(0, currentLimit);
      remainingCount = Math.max(0, items.length - currentLimit);
    } else if (type === 'link') {
      visibleItems = items.slice(0, initialLimit);
      remainingCount = items.length - initialLimit;
    }
  }

  return (
    <div className={classes} style={style}>
      <ul className="collection-grid" aria-label={label}>
        {visibleItems.map((item, index) => (
          <li key={getKey(item, index)}>{renderItem(item, index, { layout: 'grid' })}</li>
        ))}
      </ul>

      {isCapped && (
        <div className="mt-8 flex justify-center">
          {type === 'expand' && (
            <button
              type="button"
              onClick={() => setExpanded(prev => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs sm:text-sm font-semibold text-fg shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-2 hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {expanded ? (
                <>
                  <span>{t('common.showLess') || 'Thu gọn'}</span>
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>
                    {(t('common.showMoreRemaining') || 'Xem thêm ({count} mục)').replace(
                      '{count}',
                      String(remainingCount),
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {type === 'loadMore' && (
            <>
              {remainingCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setExtraRows(r => r + maxRows)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs sm:text-sm font-semibold text-fg shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-2 hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>
                    {(t('common.showMoreRemaining') || 'Xem thêm ({count} mục)').replace(
                      '{count}',
                      String(remainingCount),
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExtraRows(0)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs sm:text-sm font-semibold text-fg shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-2 hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>{t('common.showLess') || 'Thu gọn'}</span>
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </>
          )}

          {type === 'link' && (
            <>
              {seeAllHref ? (
                <Link
                  to={seeAllHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs sm:text-sm font-semibold text-fg shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-2 hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>
                    {(t('common.showMoreRemaining') || 'Xem thêm ({count} mục)').replace(
                      '{count}',
                      String(remainingCount),
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded(prev => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs sm:text-sm font-semibold text-fg shadow-xs transition-colors hover:border-primary/50 hover:bg-surface-2 hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {expanded ? (
                    <>
                      <span>{t('common.showLess') || 'Thu gọn'}</span>
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>
                        {(t('common.showMoreRemaining') || 'Xem thêm ({count} mục)').replace(
                          '{count}',
                          String(remainingCount),
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = event => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** A slide that runs without stopping. It pauses while the pointer or the keyboard is on it. */
function Ticker({ items, config, renderItem, label, classes, style }) {
  const { columns, slide } = config;
  const widest = Math.max(columns.mobile, columns.tablet, columns.desktop);
  const group = useMemo(() => repeatToFill(items, widest + 1), [items, widest]);
  // `interval` is how many seconds each item takes to pass
  const duration = Math.max(10, group.length * slide.interval);

  const renderGroup = (prefix, hidden) =>
    group.map((item, index) => {
      const isCopy = hidden || index >= items.length;
      return (
        <li key={`${prefix}-${index}`} aria-hidden={isCopy ? 'true' : undefined} inert={isCopy}>
          {renderItem(item, index % items.length, { layout: 'slide' })}
        </li>
      );
    });

  return (
    <div
      className={`${classes} collection-marquee`}
      style={{ ...style, '--duration': `${duration}s` }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="collection-marquee-track">
        <ul className="collection-marquee-group">{renderGroup('a', false)}</ul>
        <ul className="collection-marquee-group" aria-hidden="true">
          {renderGroup('b', true)}
        </ul>
      </div>
    </div>
  );
}

/** A slide that moves one page at a time, by hand or by itself, with arrows and dots. */
function Slider({ items, config, renderItem, getKey, label, classes, style }) {
  const { slide } = config;
  const location = useLocation();
  const t = getTranslation(getLocaleFromUrl(location.pathname));

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const dotsRef = useRef(null);
  const elapsedRef = useRef(0);
  const lockRef = useRef(0);
  const settleRef = useRef(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [touching, setTouching] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reduced = usePrefersReducedMotion();

  // What the slider looks like right now (how many items fit, how wide each one is)
  const measure = useCallback(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const first = track?.children[0];
    if (!root || !track || !first) return null;
    const perView = Math.max(
      1,
      parseInt(getComputedStyle(root).getPropertyValue('--per-view'), 10) || 1,
    );
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return {
      perView,
      stride: first.getBoundingClientRect().width + gap,
      maxScroll: Math.max(0, track.scrollWidth - track.clientWidth),
      pages: slidePageCount(items.length, perView),
    };
  }, [items.length]);

  // Start the wait for the next move again, and empty the filling bar of the dots
  const restartClock = useCallback(() => {
    elapsedRef.current = 0;
    dotsRef.current?.style.setProperty('--progress', '0');
  }, []);

  const goTo = useCallback(
    index => {
      const m = measure();
      if (!m || !trackRef.current) return;
      const target = wrapPage(index, 0, m.pages);
      restartClock();
      setPage(target);
      // While the slide is gliding, the scroll position must not move the dots around
      lockRef.current = Date.now() + (reduced ? 0 : 700);
      // A check planned by an earlier move must not undo this one
      clearTimeout(settleRef.current);
      trackRef.current.scrollTo({
        left: scrollLeftForPage(target, m),
        behavior: reduced ? 'auto' : 'smooth',
      });
    },
    [measure, reduced, restartClock],
  );

  // Follow the size of the row, and the visitor's own swipes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;

    const sync = () => {
      const m = measure();
      if (!m) return;
      setPages(m.pages);
      setPage(pageFromScroll(track.scrollLeft, m));
    };
    // While the slide is gliding the scroll position is not a page yet: look again once it stops
    const syncWhenSettled = () => {
      clearTimeout(settleRef.current);
      const wait = lockRef.current - Date.now();
      if (wait > 0) {
        settleRef.current = setTimeout(syncWhenSettled, wait + 60);
        return;
      }
      sync();
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // A scroll the slider did not start is the visitor swiping: the wait begins again
        if (lockRef.current - Date.now() <= 0) restartClock();
        syncWhenSettled();
      });
    };

    sync();
    track.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(syncWhenSettled);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', onScroll);
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(settleRef.current);
    };
  }, [measure, restartClock]);

  // Do not run while nobody can see it
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(root);
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const paused = hovering || focusing || touching;
  const running = slide.autoplay && !reduced;
  const active = running && pages > 1 && !paused && !offscreen && !tabHidden;

  // The clock: moves on after `interval` seconds, and fills the progress bar as time passes.
  // It ticks on a timer (not on animation frames) so it also keeps time in a quiet tab.
  useEffect(() => {
    if (!active) return undefined;
    const duration = slide.interval * 1000;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      elapsedRef.current += now - last;
      last = now;
      const progress = Math.min(1, elapsedRef.current / duration);
      dotsRef.current?.style.setProperty('--progress', String(progress));
      if (progress >= 1) {
        clearInterval(id);
        goTo(page + 1);
      }
    }, 100);
    return () => clearInterval(id);
  }, [active, page, slide.interval, goTo]);

  const move = delta => goTo(wrapPage(page, delta, pages));
  const touchTimer = useRef(0);

  return (
    <div
      ref={rootRef}
      className={`${classes} collection-slider`}
      style={style}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={event => event.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setFocusing(true)}
      onBlur={() => setFocusing(false)}
      onTouchStart={() => {
        clearTimeout(touchTimer.current);
        setTouching(true);
      }}
      onTouchEnd={() => {
        touchTimer.current = setTimeout(() => setTouching(false), 2500);
      }}
    >
      <div className="collection-stage">
        <ul
          ref={trackRef}
          className="collection-track"
          tabIndex={0}
          aria-label={label}
          onKeyDown={event => {
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              move(1);
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault();
              move(-1);
            }
          }}
        >
          {items.map((item, index) => (
            <li key={getKey(item, index)}>{renderItem(item, index, { layout: 'slide' })}</li>
          ))}
        </ul>

        {slide.arrows && pages > 1 && (
          <>
            <button
              type="button"
              className="slider-arrow slider-arrow--prev"
              aria-label={t('slider.previous')}
              onClick={() => move(-1)}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="slider-arrow slider-arrow--next"
              aria-label={t('slider.next')}
              onClick={() => move(1)}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <SliderDots
        style={slide.dots}
        pages={pages}
        page={page}
        count={items.length}
        onSelect={goTo}
        rowRef={dotsRef}
        running={running}
        label={(current, total) =>
          t('slider.page').replace('{current}', String(current)).replace('{total}', String(total))
        }
      />
    </div>
  );
}
