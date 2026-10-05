import React from 'react';
import { Star } from 'lucide-react';

/** Read-only preview of a 0 to 5 rating, so the admin sees what visitors will see. */
export function RatingStars({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`h-4 w-4 ${value >= n - 0.25 ? 'fill-warning text-warning' : 'text-border'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
