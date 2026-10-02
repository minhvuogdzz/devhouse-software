import React from 'react';

/**
 * Brand logo. Both theme variants are rendered and CSS shows the one that matches
 * `data-theme` (see app.css), so there is no flash and no hydration mismatch.
 * variant "mark": the house symbol only. variant "full": symbol + wordmark.
 */
export function Logo({ variant = 'mark', className = '', alt = '' }) {
  const file = variant === 'full' ? 'logo' : 'mark';
  const dims = variant === 'full' ? { width: 613, height: 591 } : { width: 384, height: 348 };
  return (
    <>
      <img
        src={`/brand/${file}-light.png`}
        alt={alt}
        {...dims}
        className={`logo-on-light ${className}`}
        decoding="async"
      />
      <img
        src={`/brand/${file}-dark.png`}
        alt={alt}
        aria-hidden={alt ? undefined : 'true'}
        {...dims}
        className={`logo-on-dark ${className}`}
        decoding="async"
      />
    </>
  );
}
