import React from 'react';

/** Accessible on/off switch with a visible label. */
export function Toggle({ label, hint, checked, onChange, id }) {
  const inputId = id || `toggle-${label}`;
  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
      <input
        id={inputId}
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface after:shadow-xs after:transition-transform peer-checked:after:translate-x-4"
      />
      <span>
        <span className="block text-xs font-semibold text-fg">{label}</span>
        {hint && <span className="block text-[11px] text-fg-subtle">{hint}</span>}
      </span>
    </label>
  );
}
