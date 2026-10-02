import React, { useState } from 'react';
import { Input, Textarea } from '../ui/Input.jsx';

export function LocalizedField({
  label,
  value = { vi: '', en: '' },
  onChange,
  type = 'text',
  rows = 3,
  required = false,
  error,
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'tabs'
  const [activeTab, setActiveTab] = useState('vi');

  const handleChange = (lang, val) => {
    onChange({
      ...value,
      [lang]: val,
    });
  };

  return (
    <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-surface-raised/20">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-fg">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-surface-sunken p-0.5 rounded-md text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              viewMode === 'split' ? 'bg-surface font-semibold text-fg shadow-xs' : 'text-fg-subtle'
            }`}
          >
            Song ngữ
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tabs')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              viewMode === 'tabs' ? 'bg-surface font-semibold text-fg shadow-xs' : 'text-fg-subtle'
            }`}
          >
            Tab
          </button>
        </div>
      </div>

      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-bold text-primary mb-1 flex items-center gap-1">
              <span>Tiếng Việt (VI)</span>
              {required && <span className="text-danger">*</span>}
            </div>
            {type === 'textarea' ? (
              <Textarea
                rows={rows}
                value={value?.vi || ''}
                onChange={e => handleChange('vi', e.target.value)}
                placeholder="Nội dung tiếng Việt..."
              />
            ) : (
              <Input
                value={value?.vi || ''}
                onChange={e => handleChange('vi', e.target.value)}
                placeholder="Nội dung tiếng Việt..."
              />
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold text-fg-subtle mb-1">English (EN)</div>
            {type === 'textarea' ? (
              <Textarea
                rows={rows}
                value={value?.en || ''}
                onChange={e => handleChange('en', e.target.value)}
                placeholder="English content..."
              />
            ) : (
              <Input
                value={value?.en || ''}
                onChange={e => handleChange('en', e.target.value)}
                placeholder="English content..."
              />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2 border-b border-border pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('vi')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'vi' ? 'bg-primary text-primary-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'en' ? 'bg-primary text-primary-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              English
            </button>
          </div>

          {activeTab === 'vi' ? (
            type === 'textarea' ? (
              <Textarea
                rows={rows}
                value={value?.vi || ''}
                onChange={e => handleChange('vi', e.target.value)}
                placeholder="Nội dung tiếng Việt..."
              />
            ) : (
              <Input
                value={value?.vi || ''}
                onChange={e => handleChange('vi', e.target.value)}
                placeholder="Nội dung tiếng Việt..."
              />
            )
          ) : type === 'textarea' ? (
            <Textarea
              rows={rows}
              value={value?.en || ''}
              onChange={e => handleChange('en', e.target.value)}
              placeholder="English content..."
            />
          ) : (
            <Input
              value={value?.en || ''}
              onChange={e => handleChange('en', e.target.value)}
              placeholder="English content..."
            />
          )}
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
