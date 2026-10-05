import React from 'react';
import { Star } from 'lucide-react';

/** Five stars filled to the given rating (0 to 5), shown to one decimal place beside them. */
export function Stars({ value = 0, label, className = '', showValue = true }) {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} role="img" aria-label={label}>
      <span className="inline-flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = Math.min(1, Math.max(0, rating - (n - 1)));
          return (
            <span key={n} className="relative inline-block h-3.5 w-3.5">
              <Star className="absolute inset-0 h-3.5 w-3.5 text-on-scrim/30" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && <span aria-hidden="true">{rating.toFixed(1)}</span>}
    </span>
  );
}
