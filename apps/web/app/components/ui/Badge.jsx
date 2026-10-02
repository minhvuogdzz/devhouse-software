import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-primary-subtle text-primary border border-border-subtle',
    secondary: 'bg-surface-2 text-fg-muted border border-border-subtle',
    accent: 'bg-accent/15 text-accent border border-accent/20',
    outline: 'border border-border text-fg-muted',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
