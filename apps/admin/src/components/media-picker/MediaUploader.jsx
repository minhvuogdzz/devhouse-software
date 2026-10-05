import React, { useRef, useState } from 'react';
import { UploadCloud, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { uploadLocalImage, formatBytes } from '../../lib/image-upload.js';

const STAGE_LABEL = {
  compressing: 'Đang chuyển WebP và nén…',
  uploading: 'Đang tải lên…',
  saving: 'Đang lưu vào thư viện…',
};

/**
 * Pick images from the computer (button or drag and drop). Each one is converted to WebP under
 * 1 MB in the browser, uploaded to Cloudinary and added to the media library.
 * `onUploaded` receives the list of media documents once a batch has finished.
 */
export function MediaUploader({ folder = 'site', multiple = true, onUploaded }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const patch = (id, changes) =>
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...changes } : item)));

  const handleFiles = async fileList => {
    const files = Array.from(fileList || []).slice(0, multiple ? 20 : 1);
    if (files.length === 0) return;

    const batch = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      state: 'working',
      stage: 'compressing',
      progress: 0,
    }));
    setItems(batch);

    const uploaded = [];
    for (let i = 0; i < files.length; i += 1) {
      const id = batch[i].id;
      try {
        const result = await uploadLocalImage(files[i], {
          folder,
          onStage: stage => patch(id, { stage }),
          onProgress: progress => patch(id, { progress }),
        });
        uploaded.push(result.media);
        patch(id, {
          state: 'done',
          note: `${formatBytes(result.originalBytes)} → ${formatBytes(result.bytes)} (WebP)`,
        });
      } catch (err) {
        patch(id, { state: 'error', note: err.message || 'Tải ảnh lên không thành công.' });
      }
    }

    if (uploaded.length > 0) onUploaded?.(uploaded);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isBusy = items.some(item => item.state === 'working');

  return (
    <div className="space-y-4">
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (!isBusy) handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary-subtle' : 'border-border bg-surface-raised/40'
        }`}
      >
        <UploadCloud className="w-8 h-8 mx-auto text-primary mb-3" aria-hidden="true" />
        <p className="text-sm font-semibold text-fg">Kéo thả ảnh vào đây</p>
        <p className="text-xs text-fg-muted mt-1">
          hoặc{' '}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
          >
            chọn ảnh từ máy tính
          </button>
        </p>
        <p className="text-[11px] text-fg-subtle mt-3">
          JPG, PNG, WebP hoặc AVIF. Ảnh tự động chuyển sang WebP và nén xuống dưới 1 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="sr-only"
          aria-label="Chọn ảnh từ máy tính"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-2" aria-live="polite">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs"
            >
              {item.state === 'working' && (
                <Loader2
                  className="w-4 h-4 animate-spin text-primary shrink-0"
                  aria-hidden="true"
                />
              )}
              {item.state === 'done' && (
                <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
              )}
              {item.state === 'error' && (
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{item.name}</p>
                <p className={item.state === 'error' ? 'text-danger' : 'text-fg-muted'}>
                  {item.state === 'working'
                    ? `${STAGE_LABEL[item.stage]}${
                        item.stage === 'uploading' ? ` ${Math.round(item.progress * 100)}%` : ''
                      }`
                    : item.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
