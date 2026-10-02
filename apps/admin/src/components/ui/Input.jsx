import React from 'react';

export function Input({ label, error, helperText, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-fg">
          {label} {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-fg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-surface-sunken ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-fg-subtle">{helperText}</p>}
    </div>
  );
}

export function Textarea({ label, error, helperText, className = '', id, rows = 4, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-fg">
          {label} {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-fg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-surface-sunken ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-fg-subtle">{helperText}</p>}
    </div>
  );
}

export function Select({ label, error, helperText, className = '', id, children, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-fg">
          {label} {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-fg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-surface-sunken ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-fg-subtle">{helperText}</p>}
    </div>
  );
}
