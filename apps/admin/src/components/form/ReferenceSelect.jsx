import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { Select } from '../ui/Input.jsx';

/**
 * Dropdown filled from the Categories module (for example "product-segment" or "product").
 * The admin can add more choices under Categories, so nothing here is fixed in code.
 */
export function CategorySelect({ label, type, value, onChange, manageHint }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient(`/admin/categories?type=${type}`)
      .then(res => active && setOptions(res.data || []))
      .catch(() => active && setOptions([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [type]);

  return (
    <div className="space-y-1">
      <Select label={label} value={value || ''} onChange={e => onChange(e.target.value || null)}>
        <option value="">{isLoading ? 'Đang tải…' : '— Chưa chọn —'}</option>
        {options.map(option => (
          <option key={option._id} value={option._id}>
            {option.name?.vi || option.name?.en}
          </option>
        ))}
      </Select>
      <p className="text-[11px] text-fg-subtle">
        {manageHint || 'Cần loại khác?'}{' '}
        <Link to={`/categories/${type}`} className="font-semibold text-primary hover:underline">
          Quản lý danh mục
        </Link>
      </p>
    </div>
  );
}

/** Checkbox list of items from an admin endpoint, for choosing several (packages, technologies). */
export function MultiSelect({ label, endpoint, value = [], onChange, getLabel }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let active = true;
    apiClient(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=100`)
      .then(res => active && setOptions(res.data || []))
      .catch(() => active && setOptions([]));
    return () => {
      active = false;
    };
  }, [endpoint]);

  const selected = new Set(value.map(String));
  const toggle = id => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-semibold text-fg">{label}</legend>
      {options.length === 0 ? (
        <p className="text-xs text-fg-subtle">Chưa có mục nào để chọn.</p>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {options.map(option => (
            <label
              key={option._id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs text-fg hover:bg-surface-raised"
            >
              <input
                type="checkbox"
                checked={selected.has(String(option._id))}
                onChange={() => toggle(String(option._id))}
                className="h-3.5 w-3.5 accent-[var(--color-primary)]"
              />
              <span className="truncate">{getLabel(option)}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
