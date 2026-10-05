import React, { useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import { Toggle } from '../form/Toggle.jsx';
import { DisplayField } from '../form/DisplayField.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { describeDisplay } from '../../lib/display-summary.js';

/** The field of a section that says how its list is shown, if the section has one. */
export function displayFieldOf(section) {
  const entry = Object.entries(section.fields || {}).find(([, d]) => d?.type === 'display');
  return entry ? { name: entry[0], descriptor: entry[1] } : null;
}

/**
 * Every section of a page on one screen, in the order they appear on the website. Each one has a
 * switch (a section that is off is not shown on the website), a button to edit its content, and,
 * for sections that show a list, the way the list is displayed (grid, list or slide).
 *
 *   sections   the section definitions of the page (key, label, summary, fields)
 *   values     the current content of each section, by key
 *   labelOf    the name shown for a section
 *   onChange   (key, nextContent) after a switch or a display setting changes
 *   onEdit     (key) to open the full editor of one section
 */
export function PageOverview({ sections, values, labelOf, onChange, onEdit }) {
  const [openKey, setOpenKey] = useState(null);
  const isVisible = section => values[section.key]?.visible !== false;
  const shown = sections.filter(isVisible).length;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs leading-relaxed text-fg-muted">
          Bật hoặc tắt từng khối: khối đã tắt sẽ không hiện trên website. Với khối dạng danh sách,
          chọn lưới, danh sách hay slide ngay tại đây. Bấm “Lưu thay đổi” để áp dụng.
        </p>
        <p className="text-[11px] font-semibold text-fg-subtle">
          Đang hiện {shown}/{sections.length} khối
        </p>
      </div>

      <ol className="space-y-3">
        {sections.map((section, index) => {
          const current = values[section.key] || {};
          const visible = isVisible(section);
          const display = displayFieldOf(section);
          const isOpen = openKey === section.key;
          const panelId = `overview-${section.key}-display`;

          return (
            <li
              key={section.key}
              className={`rounded-xl border p-4 transition-colors ${
                visible ? 'border-border bg-surface' : 'border-border/60 bg-surface-sunken/60'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Toggle
                  label={`${index + 1}. ${labelOf(section)}`}
                  hint={section.summary}
                  checked={visible}
                  onChange={next => onChange(section.key, { ...current, visible: next })}
                />
                <div className="flex shrink-0 items-center gap-2">
                  {!visible && <Badge variant="secondary">Đang ẩn</Badge>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(section.key)}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Sửa nội dung
                  </Button>
                </div>
              </div>

              {display && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-surface-raised"
                  >
                    <span>
                      <span className="font-semibold text-fg">Kiểu hiển thị: </span>
                      <span className="text-fg-muted">
                        {describeDisplay(current[display.name])}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-semibold text-primary">
                      {isOpen ? 'Thu gọn' : 'Thay đổi'}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div id={panelId} className="mt-2">
                      <DisplayField
                        label="Cách hiển thị"
                        value={current[display.name]}
                        descriptor={display.descriptor}
                        onChange={next =>
                          onChange(section.key, { ...current, [display.name]: next })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
