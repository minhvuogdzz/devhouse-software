import React, { useEffect, useRef, useState } from 'react';
import { Eye, Play, ImageIcon } from 'lucide-react';
import { resizedImage } from '../../lib/images.js';
import { Stars } from '../ui/Stars.jsx';

const ROTATE_MS = 3000;

function useAutoRotate(count, rootRef) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let timer = null;
    const start = () => {
      if (!timer) timer = setInterval(() => setIndex(i => (i + 1) % count), ROTATE_MS);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    // Only rotate while the card is on screen and the tab is visible.
    const observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    if (rootRef.current) observer.observe(rootRef.current);
    const onVisibility = () => (document.hidden ? stop() : undefined);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, rootRef]);

  return count > 0 ? index % count : 0;
}

/**
 * Website template card, 4:6. A photo fills the card and rotates through up to 3 images every
 * 3 seconds. Hovering (or tapping on a touch screen, or focusing with the keyboard) dims it and
 * shows the category, rating, views and the demo button.
 */
export function ProductCard({ product, locale, t, onOpenDemo }) {
  const rootRef = useRef(null);
  const [failed, setFailed] = useState(() => new Set());
  // A picture that cannot be loaded is skipped, so the card never shows a broken-image icon
  const images = (product.thumbnails || []).filter(image => image?.url && !failed.has(image.url));
  const current = useAutoRotate(images.length, rootRef);
  const [touchOpen, setTouchOpen] = useState(false);
  const [canHover, setCanHover] = useState(true);

  const markFailed = url => setFailed(previous => new Set(previous).add(url));

  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches);
    // An image may already have failed before this component became interactive
    rootRef.current?.querySelectorAll('img').forEach(img => {
      if (img.complete && img.naturalWidth === 0) markFailed(img.dataset.key);
    });
  }, []);

  // On a touch screen, tapping anywhere else closes the details again
  useEffect(() => {
    if (!touchOpen) return undefined;
    const close = event => {
      if (!rootRef.current?.contains(event.target)) setTouchOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [touchOpen]);

  const views = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN').format(
    product.views || 0,
  );

  const overlayVisible =
    'group-hover:opacity-100 group-focus-within:opacity-100 ' +
    (touchOpen ? 'opacity-100' : 'opacity-0');

  return (
    <article
      ref={rootRef}
      tabIndex={0}
      aria-label={product.name}
      onClick={() => !canHover && setTouchOpen(open => !open)}
      className="group relative aspect-[4/6] cursor-pointer overflow-hidden rounded-md bg-surface-2 ring-1 ring-border transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {images.length > 0 ? (
        images.map((image, index) => (
          <img
            key={image.url}
            src={resizedImage(image.url, 640)}
            alt={index === current ? image.alt || product.name : ''}
            aria-hidden={index === current ? undefined : 'true'}
            width={image.width || 640}
            height={image.height || 960}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            data-key={image.url}
            onError={() => markFailed(image.url)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-subtle to-surface-3">
          <ImageIcon className="h-8 w-8 text-primary/50" aria-hidden="true" />
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute right-2 top-2 flex gap-1" aria-hidden="true">
          {images.map((image, index) => (
            <span
              key={image.url}
              className={`h-1 w-4 rounded-full transition-colors ${
                index === current ? 'bg-on-scrim' : 'bg-on-scrim/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Always-visible title, so a card is never an unlabelled picture */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim/85 via-scrim/40 to-transparent p-3 pt-10 text-on-scrim">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug">
          {product.name}
        </h3>
      </div>

      {/* Details on hover / focus / tap */}
      <div
        className={`absolute inset-0 flex flex-col justify-between bg-scrim/75 p-3 text-on-scrim backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:p-4 ${overlayVisible}`}
      >
        <div className="space-y-2">
          {product.category?.name && (
            <span className="inline-block rounded-full border border-on-scrim/30 px-2 py-0.5 text-[11px] font-medium">
              {product.category.name}
            </span>
          )}
          <h3 className="font-display text-base font-semibold leading-snug">{product.name}</h3>
          {product.shortDescription && (
            <p className="line-clamp-3 text-xs leading-relaxed text-on-scrim/80">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <Stars
              value={product.rating}
              label={t('products.ratingValue').replace(
                '{value}',
                Number(product.rating || 0).toFixed(1),
              )}
            />
            <span
              className="inline-flex items-center gap-1"
              aria-label={`${views} ${t('products.views')}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span aria-hidden="true">
                {views} {t('products.views')}
              </span>
            </span>
          </div>

          {product.demoUrl && (
            <button
              type="button"
              onClick={event => {
                event.stopPropagation();
                onOpenDemo(product);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-scrim cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {t('products.viewDemo')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
