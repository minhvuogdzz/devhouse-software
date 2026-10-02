import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-primary-subtle text-primary border-primary/20',
    success: 'bg-success-subtle text-success border-success/20',
    warning: 'bg-warning-subtle text-warning border-warning/20',
    danger: 'bg-danger-subtle text-danger border-danger/20',
    secondary: 'bg-surface-raised text-fg-muted border-border',
    outline: 'border-border text-fg-muted',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
