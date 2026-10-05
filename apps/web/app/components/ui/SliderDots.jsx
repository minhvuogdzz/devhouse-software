import React from 'react';

/** More pages than this are shown as "3 / 24" instead, so a long row of dots never spills over. */
export const MAX_DOTS = 20;

/**
 * The dots under a slide. The admin picks one of three looks:
 *   dot        plain round dots; the current one is solid
 *   progress   little bars; the current one fills up while the slide waits for its next move
 *   slide      round dots with one pill that glides to the current one
 *
 * All the marks live in one row, and everything is measured from the first mark, so the pill and
 * the bars stay put wherever the row sits on the page. The slider writes how far the wait has
 * come into `--progress` on `rowRef`; the CSS turns that into the filling bar.
 */
export function SliderDots({ style, pages, page, onSelect, rowRef, running, label }) {
  if (style === 'none' || pages < 2) return null;

  if (pages > MAX_DOTS) {
    return (
      <p className="slider-dots-count">
        {page + 1} / {pages}
      </p>
    );
  }

  return (
    <div className={`slider-dots slider-dots--${style}`} role="group">
      <div
        ref={rowRef}
        className="slider-dots-row"
        data-running={running ? 'true' : 'false'}
        style={{ '--index': page }}
      >
        {Array.from({ length: pages }, (_, index) => {
          const state = index === page ? 'active' : index < page ? 'done' : 'todo';
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={label(index + 1, pages)}
              aria-current={state === 'active' ? 'true' : undefined}
              data-state={state}
            >
              <span className="slider-dots-mark">
                {style === 'progress' && <i className="slider-dots-fill" />}
              </span>
            </button>
          );
        })}
        {style === 'slide' && <span className="slider-dots-thumb" aria-hidden="true" />}
      </div>
    </div>
  );
}
