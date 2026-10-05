import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

/**
 * Editable list: add, remove and reorder items. `renderItem(item, setItem, index)` draws the
 * inputs for one item and `createItem()` returns a new empty item.
 */
export function ListField({
  label,
  hint,
  items = [],
  onChange,
  renderItem,
  createItem,
  max,
  itemTitle = (_item, index) => `Mục ${index + 1}`,
  addLabel = 'Thêm mục',
  emptyText = 'Chưa có mục nào.',
}) {
  const list = Array.isArray(items) ? items : [];

  const update = (index, next) => onChange(list.map((item, i) => (i === index ? next : item)));
  const remove = index => onChange(list.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {(label || hint) && (
        <div>
          {label && <p className="text-xs font-semibold text-fg">{label}</p>}
          {hint && <p className="text-[11px] text-fg-subtle">{hint}</p>}
        </div>
      )}

      {list.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-fg-subtle">
          {emptyText}
        </p>
      )}

      <div className="space-y-3">
        {list.map((item, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface-raised/30">
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                {itemTitle(item, index)}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Chuyển lên"
                  className="rounded p-1 text-fg-muted hover:bg-surface-raised hover:text-fg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1}
                  aria-label="Chuyển xuống"
                  className="rounded p-1 text-fg-muted hover:bg-surface-raised hover:text-fg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Xoá mục này"
                  className="rounded p-1 text-danger hover:bg-danger-subtle cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 p-3">
              {renderItem(item, next => update(index, next), index)}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={max !== undefined && list.length >= max}
        onClick={() => onChange([...list, createItem()])}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
