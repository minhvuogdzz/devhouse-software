import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-surface border border-border rounded-xl shadow-xs ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 border-b border-border ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`p-5 sm:p-6 border-t border-border bg-surface-raised/50 rounded-b-xl ${className}`}
    >
      {children}
    </div>
  );
}
