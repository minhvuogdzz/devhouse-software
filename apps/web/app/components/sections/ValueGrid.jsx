import React from 'react';
import { iconFor } from '../../lib/icons.js';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';

const COLUMNS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

/** Cards with an icon (optional), a title and a short text. Used for values, audiences and notes. */
export function ValueGrid({ items = [], columns = 4, className = '' }) {
  if (!items.length) return null;
  return (
    <ul
      className={`grid grid-cols-1 gap-4 lg:gap-5 ${COLUMNS[columns] || COLUMNS[4]} ${className}`}
    >
      {items.map((item, index) => {
        const Icon = item.icon ? iconFor(item.icon) : null;
        return (
          <li key={`${item.title}-${index}`} className="flex">
            <ScrollReveal direction="up" delay={Math.min(index, 4) * 0.06} className="flex w-full">
              <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:p-6 transition-colors hover:border-primary/40">
                {Icon && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
                <h3 className="font-display text-base font-bold text-fg">{item.title}</h3>
                {item.description && (
                  <p className="text-sm leading-relaxed text-fg-muted">{item.description}</p>
                )}
              </div>
            </ScrollReveal>
          </li>
        );
      })}
    </ul>
  );
}
