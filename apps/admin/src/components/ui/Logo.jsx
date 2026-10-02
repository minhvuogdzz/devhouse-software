import React from 'react';

/** Brand mark; the variant matching the active theme is shown by CSS (see admin.css). */
export function Logo({ className = '' }) {
  return (
    <>
      <img
        src="/brand/mark-light.png"
        alt=""
        width="384"
        height="348"
        className={`logo-on-light ${className}`}
      />
      <img
        src="/brand/mark-dark.png"
        alt=""
        width="384"
        height="348"
        aria-hidden="true"
        className={`logo-on-dark ${className}`}
      />
    </>
  );
}
