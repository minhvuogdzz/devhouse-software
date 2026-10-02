import React from 'react';
import { Link } from 'react-router';

export function Button({
  as: Component = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-center';

  const variants = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active shadow-sm',
    secondary: 'bg-surface-2 text-fg hover:bg-surface-3 border border-border-subtle',
    outline: 'border border-border text-fg hover:bg-surface-2 hover:border-border',
    ghost: 'text-fg hover:bg-surface-2',
    accent: 'bg-accent text-accent-fg hover:opacity-90',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-5 py-2.5 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5',
  };

  const combinedClasses = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}
