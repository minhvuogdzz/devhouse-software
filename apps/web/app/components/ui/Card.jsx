import React from 'react';

export function Card({ children, className = '', hover = true, ...props }) {
  const hoverClass = hover
    ? 'hover:border-primary/50 hover:shadow-md transition-all duration-200'
    : '';

  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 shadow-xs ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
