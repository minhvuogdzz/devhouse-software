import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-border space-x-1 ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-fg-muted hover:text-fg hover:border-border'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-primary-subtle text-primary' : 'bg-surface-sunken text-fg-subtle'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
