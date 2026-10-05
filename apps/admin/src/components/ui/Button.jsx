import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-primary text-primary-fg hover:bg-primary-hover focus:ring-primary',
    secondary:
      'bg-surface-raised text-fg hover:bg-surface-sunken border border-border focus:ring-primary',
    outline:
      'border border-border bg-transparent text-fg hover:bg-surface-raised focus:ring-primary',
    danger: 'bg-danger text-danger-fg hover:bg-danger/90 focus:ring-danger',
    ghost: 'bg-transparent text-fg-muted hover:text-fg hover:bg-surface-raised focus:ring-primary',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  // `as` lets a button render as a router <Link> (or any element) while keeping its look.
  const isNativeButton = Component === 'button';
  const elementProps = isNativeButton ? { type, disabled: disabled || isLoading } : {};

  return (
    <Component
      {...elementProps}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      {children}
    </Component>
  );
}
