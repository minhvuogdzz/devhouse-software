import React from 'react';
import {
  GalleryHorizontal,
  LayoutGrid,
  List as ListIcon,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { DOT_STYLES, normalizeDisplay } from '@devhouse/shared';
import { Select } from '../ui/Input.jsx';
import { Toggle } from './Toggle.jsx';

const LAYOUTS = [
  { id: 'grid', label: 'Lưới', hint: 'Nhiều cột', icon: LayoutGrid },
  { id: 'list', label: 'Danh sách', hint: 'Mỗi mục một hàng', icon: ListIcon },
  { id: 'slide', label: 'Trượt', hint: 'Chạy ngang', icon: GalleryHorizontal },
];

const MOTIONS = [
  { id: 'step', label: 'Từng trang', hint: 'Chuyển một trang mỗi lần, có nút và chấm' },
  { id: 'smooth', label: 'Chạy liên tục', hint: 'Cuộn đều không ngừng, tạm dừng khi rê chuột' },
];

const DEVICES = [
  { key: 'mobile', label: 'Điện thoại', icon: Smartphone },
  { key: 'tablet', label: 'Máy tính bảng', icon: Tablet },
  { key: 'desktop', label: 'Máy tính', icon: Monitor },
];

const DOT_LABELS = {
  none: 'Không hiện chấm',
  dot: 'Chấm tròn',
  progress: 'Chấm tiến trình',
  slide: 'Chấm trượt',
};

/**
 * A small drawing of each kind of dots, so the admin can see what they are choosing. Same
 * proportions as on the website: round dots 8px wide, little bars 28px wide, and a pill that
 * sits on the first dot.
 */
function DotPreview({ style }) {
  if (style === 'none') return <span className="text-[10px] text-fg-subtle">—</span>;
  if (style === 'progress') {
    return (
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-1 w-7 rounded-full bg-primary" />
        <span className="relative h-1 w-7 overflow-hidden rounded-full bg-fg/25">
          <span className="absolute inset-y-0 left-0 w-3/5 bg-primary" />
        </span>
        <span className="h-1 w-7 rounded-full bg-fg/25" />
      </span>
    );
  }
  if (style === 'slide') {
    return (
      <span className="relative flex items-center" aria-hidden="true">
        {[0, 1, 2].map(index => (
          <span key={index} className="flex w-5 justify-center">
            <span className="h-2 w-2 rounded-full bg-fg/25" />
          </span>
        ))}
        <span className="absolute -left-0.5 h-2 w-6 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2" aria-hidden="true">
      <span className="h-2 w-2 scale-125 rounded-full bg-primary" />
      <span className="h-2 w-2 rounded-full bg-fg/25" />
      <span className="h-2 w-2 rounded-full bg-fg/25" />
    </span>
  );
}

const SHOW_MORE_TYPE_OPTIONS = [
  { id: 'expand', label: 'Mở rộng tại chỗ', hint: 'Bung toàn bộ và hiện nút Thu gọn' },
  { id: 'loadMore', label: 'Tải thêm từng đợt', hint: 'Mở thêm hàng mới mỗi lần bấm' },
  { id: 'link', label: 'Dẫn sang trang đầy đủ', hint: 'Chuyển hướng đến trang danh mục chi tiết' },
];

/**
 * Chooses how a list is shown on the website: grid, list or slide, how many items are visible on
 * each device, and for a slide how it moves and which dots it has.
 */
export function DisplayField({ label = 'Cách hiển thị danh sách', value, onChange, descriptor }) {
  const display = normalizeDisplay(value);
  const maxColumns = descriptor?.maxColumns ?? 6;
  const layouts = LAYOUTS.filter(
    item => !descriptor?.layouts || descriptor.layouts.includes(item.id),
  );
  const columnOptions = Array.from({ length: maxColumns }, (_, index) => index + 1);

  const update = patch => onChange(normalizeDisplay({ ...display, ...patch }));
  const updateColumns = (key, number) =>
    update({ columns: { ...display.columns, [key]: Number(number) } });
  const updateSlide = patch => update({ slide: { ...display.slide, ...patch } });
  const updateShowMore = patch => update({ showMore: { ...display.showMore, ...patch } });

  const isSlide = display.layout === 'slide';
  const isStep = display.slide.motion === 'step';

  return (
    <fieldset className="space-y-4 rounded-xl border border-border/70 bg-surface-raised/30 p-4">
      <legend className="px-1 text-xs font-bold text-fg">{label}</legend>

      <div role="radiogroup" aria-label="Kiểu hiển thị" className="grid grid-cols-3 gap-2">
        {layouts.map(({ id, label: name, hint, icon: Icon }) => {
          const active = display.layout === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ layout: id })}
              className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-center transition-colors cursor-pointer ${
                active
                  ? 'border-primary bg-primary-subtle text-primary'
                  : 'border-border bg-surface text-fg-muted hover:border-primary/40 hover:text-fg'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-semibold">{name}</span>
              <span className="text-[10px] opacity-80">{hint}</span>
            </button>
          );
        })}
      </div>

      {display.layout !== 'list' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-fg">
            Số mục hiển thị cùng lúc{isSlide ? ' (trên mỗi trang trượt)' : ' (số cột)'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DEVICES.map(({ key, label: name, icon: Icon }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
                <Select
                  aria-label={`Số cột trên ${name}`}
                  value={display.columns[key]}
                  onChange={event => updateColumns(key, event.target.value)}
                >
                  {columnOptions.map(number => (
                    <option key={number} value={number}>
                      {name}: {number} {number === 1 ? 'cột' : 'cột'}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {display.layout === 'grid' && (
        <div className="space-y-3 border-t border-border/70 pt-4">
          <Toggle
            label="Giới hạn số hàng & Nút xem thêm (Show more)"
            hint="Chỉ hiện tối đa số hàng quy định (mặc định 2 hàng) và cung cấp nút xem thêm cho người dùng."
            checked={display.showMore?.enabled ?? true}
            onChange={enabled => updateShowMore({ enabled })}
          />

          {(display.showMore?.enabled ?? true) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Số hàng tối đa ban đầu"
                value={display.showMore?.maxRows ?? 2}
                onChange={event => updateShowMore({ maxRows: Number(event.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map(rows => (
                  <option key={rows} value={rows}>
                    {rows} hàng {rows === 2 ? '(mặc định 2 hàng)' : ''}
                  </option>
                ))}
              </Select>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-fg">Kiểu nút Xem thêm (Type of Show more)</p>
                <div
                  role="radiogroup"
                  aria-label="Kiểu nút Xem thêm"
                  className="space-y-1.5"
                >
                  {SHOW_MORE_TYPE_OPTIONS.map(({ id, label: typeName, hint }) => {
                    const active = (display.showMore?.type ?? 'expand') === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => updateShowMore({ type: id })}
                        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-primary bg-primary-subtle text-primary'
                            : 'border-border bg-surface text-fg-muted hover:border-primary/40 hover:text-fg'
                        }`}
                      >
                        <span className="text-xs font-semibold">{typeName}</span>
                        <span className="text-[11px] opacity-80">{hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isSlide && (
        <div className="space-y-4 border-t border-border/70 pt-4">
          <div
            role="radiogroup"
            aria-label="Kiểu trượt"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {MOTIONS.map(({ id, label: name, hint }) => {
              const active = display.slide.motion === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateSlide({ motion: id })}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-primary bg-primary-subtle'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`block text-xs font-semibold ${active ? 'text-primary' : 'text-fg'}`}
                  >
                    {name}
                  </span>
                  <span className="block text-[11px] text-fg-muted">{hint}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Toggle
              label="Tự động chạy"
              hint={
                isStep
                  ? 'Tự chuyển trang sau mỗi vài giây. Dừng khi khách rê chuột hoặc chạm vào.'
                  : 'Tắt đi thì thành slide khách tự kéo.'
              }
              checked={display.slide.autoplay}
              onChange={autoplay => updateSlide({ autoplay })}
            />
            {display.slide.autoplay && (
              <Select
                label={isStep ? 'Thời gian giữa hai lần chuyển' : 'Thời gian mỗi mục đi qua'}
                value={display.slide.interval}
                onChange={event => updateSlide({ interval: Number(event.target.value) })}
              >
                {[2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(seconds => (
                  <option key={seconds} value={seconds}>
                    {seconds} giây
                  </option>
                ))}
              </Select>
            )}
          </div>

          {(isStep || !display.slide.autoplay) && (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-fg">Kiểu chấm bên dưới</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DOT_STYLES.map(style => {
                    const active = display.slide.dots === style;
                    return (
                      <button
                        key={style}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateSlide({ dots: style })}
                        className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-2.5 text-center transition-colors cursor-pointer ${
                          active
                            ? 'border-primary bg-primary-subtle text-primary'
                            : 'border-border bg-surface text-fg-muted hover:border-primary/40'
                        }`}
                      >
                        <span className="flex h-4 items-center">
                          <DotPreview style={style} />
                        </span>
                        <span className="text-[11px] font-semibold">{DOT_LABELS[style]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Toggle
                label="Hiện nút trước / sau"
                hint="Hai nút mũi tên ở hai bên (chỉ hiện trên máy tính bảng và máy tính)."
                checked={display.slide.arrows}
                onChange={arrows => updateSlide({ arrows })}
              />
            </>
          )}
        </div>
      )}
    </fieldset>
  );
}
