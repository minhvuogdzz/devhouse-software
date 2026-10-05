import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { MediaUploader } from '../media-picker/MediaUploader.jsx';
import { MediaPickerModal } from '../media-picker/MediaPickerModal.jsx';

const blank = () => ({ vi: '', en: '' });

/** The value stored for a media document (same shape the single image picker produces). */
const imageFromMedia = media => ({
  mediaId: media._id,
  publicId: media.publicId,
  url: media.secureUrl || media.url,
  width: media.width,
  height: media.height,
  alt: media.alt || blank(),
});

/**
 * Any number of pictures for a slide, each with an optional caption. Pictures are picked from the
 * computer (many at once) and are converted to WebP under 1 MB before they are uploaded.
 */
export function GalleryField({ label, hint, value, onChange }) {
  const entries = Array.isArray(value) ? value : [];
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const add = images =>
    onChange([...entries, ...images.map(image => ({ image, caption: blank() }))]);
  const patch = (index, next) =>
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...next } : entry)));
  const remove = index => onChange(entries.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-fg">{label}</p>
        <p className="text-[11px] text-fg-subtle">
          {hint ||
            'Không giới hạn số ảnh. Kéo thả nhiều ảnh cùng lúc; ảnh tự chuyển sang WebP và nén xuống dưới 1 MB.'}
        </p>
      </div>

      {entries.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <li
              key={`${entry.image?.url}-${index}`}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] bg-surface-sunken">
                {entry.image?.url && (
                  <img src={entry.image.url} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-scrim/70 px-2 py-0.5 text-[10px] font-bold text-on-scrim">
                  {index + 1}
                </span>
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Chuyển lên trước"
                    className="rounded bg-scrim/70 p-1 text-on-scrim disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === entries.length - 1}
                    aria-label="Chuyển ra sau"
                    className="rounded bg-scrim/70 p-1 text-on-scrim disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Xoá ảnh này"
                    className="rounded bg-scrim/70 p-1 text-on-scrim cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <Input
                  label="Chú thích (tiếng Việt)"
                  value={entry.caption?.vi || ''}
                  onChange={event =>
                    patch(index, {
                      caption: { ...(entry.caption || blank()), vi: event.target.value },
                    })
                  }
                />
                <Input
                  label="Chú thích (English)"
                  value={entry.caption?.en || ''}
                  onChange={event =>
                    patch(index, {
                      caption: { ...(entry.caption || blank()), en: event.target.value },
                    })
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <MediaUploader folder="site" multiple onUploaded={media => add(media.map(imageFromMedia))} />

      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsLibraryOpen(true)}>
          <ImagePlus className="mr-1.5 h-4 w-4" />
          Thêm ảnh từ thư viện
        </Button>
      </div>

      <MediaPickerModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={image => image && add([image])}
      />
    </div>
  );
}
