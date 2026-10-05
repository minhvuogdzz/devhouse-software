import React from 'react';
import { ImagePlus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageField } from '../media-picker/MediaPickerModal.jsx';

/**
 * Up to `max` card images. On the website they are shown one after another every 3 seconds,
 * in the order set here.
 */
export function ThumbnailsField({ label, value = [], onChange, max = 3 }) {
  const images = Array.isArray(value) ? value : [];

  const set = (index, image) => {
    if (!image) return remove(index);
    const next = [...images];
    next[index] = image;
    onChange(next);
  };
  const remove = index => onChange(images.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold text-fg">{label}</p>
        <p className="text-[11px] text-fg-subtle">
          Tối đa {max} ảnh, tự chuyển ảnh mỗi 3 giây trên thẻ. Ảnh tải từ máy sẽ tự chuyển sang WebP
          và nén dưới 1 MB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: max }, (_, index) => {
          const image = images[index];
          const isNextFree = index === images.length;
          return (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-border bg-surface-raised/30 p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                  Ảnh {index + 1}
                </span>
                {image && (
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Đưa ảnh ${index + 1} lên trước`}
                      className="rounded p-1 text-fg-muted hover:text-fg disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label={`Đưa ảnh ${index + 1} ra sau`}
                      className="rounded p-1 text-fg-muted hover:text-fg disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Xoá ảnh ${index + 1}`}
                      className="rounded p-1 text-danger hover:bg-danger-subtle cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {image ? (
                <ImageField value={image} onChange={next => set(index, next)} aspect="portrait" />
              ) : isNextFree ? (
                <ImageField
                  value={null}
                  onChange={next => next && set(index, next)}
                  aspect="portrait"
                />
              ) : (
                <div className="flex aspect-[4/6] items-center justify-center rounded-lg border border-dashed border-border text-fg-subtle">
                  <ImagePlus className="h-5 w-5 opacity-40" aria-hidden="true" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
