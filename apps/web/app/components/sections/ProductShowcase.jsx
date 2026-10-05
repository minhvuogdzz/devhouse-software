import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from './ProductCard.jsx';
import { DemoModal } from './DemoModal.jsx';

const GRID = 'grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5';

function distinctBy(products, key) {
  const seen = new Map();
  for (const product of products) {
    const ref = product[key];
    if (ref?.slug && !seen.has(ref.slug)) seen.set(ref.slug, ref);
  }
  return [...seen.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function Chips({ label, allLabel, items, value, onChange }) {
  if (items.length === 0) return null;
  const chip = active =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
      active
        ? 'border-primary bg-primary text-primary-fg'
        : 'border-border bg-surface text-fg-muted hover:border-primary/50 hover:text-fg'
    }`;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="mr-1 text-xs font-semibold text-fg-subtle">{label}</span>
      <button
        type="button"
        className={chip(!value)}
        aria-pressed={!value}
        onClick={() => onChange('')}
      >
        {allLabel}
      </button>
      {items.map(item => (
        <button
          key={item.slug}
          type="button"
          className={chip(value === item.slug)}
          aria-pressed={value === item.slug}
          onClick={() => onChange(item.slug)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

/**
 * The template cards, with optional filters by area ("mảng") and type ("thể loại").
 * The filters live in the address (?segment=...&category=...), so a filtered view can be shared.
 * Opening a demo shows it inside the page; the visitor never leaves the site.
 */
export function ProductShowcase({ products, locale, prefix, t, filterable = false, empty = null }) {
  const [params, setParams] = useSearchParams();
  const [activeDemo, setActiveDemo] = useState(null);

  const segment = filterable ? params.get('segment') || '' : '';
  const category = filterable ? params.get('category') || '' : '';

  const segments = useMemo(() => distinctBy(products, 'segment'), [products]);
  const categories = useMemo(
    () =>
      distinctBy(
        segment ? products.filter(p => p.segment?.slug === segment) : products,
        'category',
      ),
    [products, segment],
  );

  const visible = useMemo(
    () =>
      products.filter(
        p =>
          (!segment || p.segment?.slug === segment) && (!category || p.category?.slug === category),
      ),
    [products, segment, category],
  );

  const update = useCallback(
    (name, value) => {
      const next = new URLSearchParams(params);
      if (value) next.set(name, value);
      else next.delete(name);
      // Changing the area resets the type, which may not exist in the new area
      if (name === 'segment') next.delete('category');
      setParams(next, { replace: true, preventScrollReset: true });
    },
    [params, setParams],
  );

  const closeDemo = useCallback(() => setActiveDemo(null), []);

  const contactHref = product => `${prefix}/contact?interest=${encodeURIComponent(product.name)}`;

  return (
    <div className="space-y-6">
      {filterable && (segments.length > 0 || categories.length > 0) && (
        <div className="space-y-3" role="region" aria-label={t('products.filtersLabel')}>
          <Chips
            label={t('products.filterSegment')}
            allLabel={t('products.allSegments')}
            items={segments}
            value={segment}
            onChange={value => update('segment', value)}
          />
          <Chips
            label={t('products.filterCategory')}
            allLabel={t('products.allCategories')}
            items={categories}
            value={category}
            onChange={value => update('category', value)}
          />
          <p className="text-xs text-fg-subtle" aria-live="polite">
            {t('products.count').replace('{count}', String(visible.length))}
          </p>
        </div>
      )}

      {visible.length > 0 ? (
        <ul className={GRID} aria-label={t('products.listLabel')}>
          {visible.map(product => (
            <li key={product._id || product.slug}>
              <ProductCard product={product} locale={locale} t={t} onOpenDemo={setActiveDemo} />
            </li>
          ))}
        </ul>
      ) : products.length > 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <p className="text-sm text-fg-muted">{t('products.noMatch')}</p>
          <button
            type="button"
            onClick={() =>
              setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })
            }
            className="text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            {t('products.clearFilters')}
          </button>
        </div>
      ) : (
        empty
      )}

      {activeDemo && (
        <DemoModal
          product={activeDemo}
          t={t}
          contactHref={contactHref(activeDemo)}
          onClose={closeDemo}
        />
      )}
    </div>
  );
}
