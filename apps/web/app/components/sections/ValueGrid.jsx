import React from 'react';
import { iconFor } from '../../lib/icons.js';
import { Collection } from '../ui/Collection.jsx';

/** One card: an icon (optional), a title and a short text. In a list it sits in a row. */
function ValueCard({ item, layout }) {
  const Icon = item.icon ? iconFor(item.icon) : null;
  const row = layout === 'list';
  return (
    <div
      className={`flex w-full gap-3 rounded-xl border border-border bg-surface p-5 sm:p-6 transition-colors hover:border-primary/40 ${
        row ? 'flex-row items-start gap-4' : 'h-full flex-col'
      }`}
    >
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="space-y-2">
        <h3 className="font-display text-base font-bold text-fg">{item.title}</h3>
        {item.description && (
          <p className="text-sm leading-relaxed text-fg-muted">{item.description}</p>
        )}
      </div>
    </div>
  );
}

/** Cards with an icon, a title and a text, shown as the admin chose (grid, list or slide). */
export function ValueGrid({ items = [], display, label, className = '' }) {
  return (
    <Collection
      items={items}
      display={display}
      label={label}
      className={className}
      getKey={(item, index) => `${item.title}-${index}`}
      renderItem={(item, _index, { layout }) => <ValueCard item={item} layout={layout} />}
    />
  );
}
