import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/Button.jsx';
import { ArrowLeft, Trash2, Save } from 'lucide-react';

export function ResourceForm({
  title,
  subtitle,
  children,
  onSubmit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
  backUrl,
  status,
  onStatusChange,
  extraActions,
}) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          {backUrl && (
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold font-display text-fg">{title}</h1>
            {subtitle && <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status !== undefined && onStatusChange && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-fg-muted">Trạng thái:</span>
              <select
                value={status}
                onChange={e => onStatusChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-surface text-fg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="published">Đã xuất bản (Published)</option>
                <option value="archived">Lưu trữ (Archived)</option>
              </select>
            </div>
          )}

          {extraActions}
        </div>
      </div>

      {/* Main Content Fields */}
      <div className="space-y-6">{children}</div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-md border-t border-border px-6 py-3.5 flex items-center justify-between">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onDelete}
              isLoading={isDeleting}
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Xóa bản ghi
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {backUrl && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate(backUrl)}
              disabled={isSubmitting || isDeleting}
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting || isDeleting}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </form>
  );
}
