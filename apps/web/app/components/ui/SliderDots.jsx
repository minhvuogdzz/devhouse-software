import React from 'react';

/**
 * The dots under a slide. The admin picks one of three looks:
 *   dot        plain round dots; the current one is solid
 *   progress   little bars; the current one fills up while the slide waits for its next move
 *   slide      round dots with one pill that glides to the current one
 * `progressRef` is attached to the filling bar of the current page, and the slider moves it.
 */
export function SliderDots({ style, pages, page, onSelect, progressRef, running, label }) {
  if (style === 'none' || pages < 2) return null;

  return (
    <div className={`slider-dots slider-dots--${style}`} style={{ '--index': page }} role="group">
      {style === 'slide' && <span className="slider-dots-thumb" aria-hidden="true" />}
      {Array.from({ length: pages }, (_, index) => {
        const state = index === page ? 'active' : index < page ? 'done' : 'todo';
        return (
          <button
            key={`${index}-${state}`}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={label(index + 1, pages)}
            aria-current={state === 'active' ? 'true' : undefined}
            data-done={state === 'done' ? 'true' : undefined}
          >
            {style === 'progress' && (
              <span
                ref={state === 'active' ? progressRef : undefined}
                style={{
                  transform:
                    state === 'done' || (state === 'active' && !running)
                      ? 'scaleX(1)'
                      : 'scaleX(0)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
