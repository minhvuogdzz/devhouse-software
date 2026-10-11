import React from 'react';

/** Official Devhouse brand logo (/brand/devhouse logo.png). */
export function Logo({ className = '', alt = 'Devhouse Software' }) {
  return (
    <img
      src="/brand/devhouse logo.png"
      alt={alt}
      width="512"
      height="512"
      className={`object-contain ${className}`}
      decoding="async"
    />
  );
}

