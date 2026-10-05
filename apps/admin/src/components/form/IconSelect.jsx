import React from 'react';
import { ICON_KEYS } from '@devhouse/shared';
import { iconFor } from '../../lib/icons.js';

/** Pick an icon from the set the website knows how to draw. */
export function IconSelect({ label, value, onChange, options = ICON_KEYS }) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-semibold text-fg">{label}</p>}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map(key => {
          const Icon = iconFor(key);
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              title={key}
              onClick={() => onChange(key)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                selected
                  ? 'border-primary bg-primary-subtle text-primary'
                  : 'border-border text-fg-muted hover:text-fg hover:bg-surface-raised'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{key}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
