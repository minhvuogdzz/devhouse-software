import React from 'react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Search, ChevronLeft, ChevronRight, Inbox, ArrowUpDown } from 'lucide-react';

export function DataTable({
  columns,
  data = [],
  isLoading = false,
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  pagination,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  actions,
  extraFilters,
  emptyMessage = 'Chưa có dữ liệu nào.',
}) {
  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {onSearchChange && (
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search || ''}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface text-fg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          )}

          {statusOptions && onStatusFilterChange && (
            <div className="flex items-center gap-1 bg-surface-sunken p-1 rounded-lg text-xs">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusFilterChange(opt.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-surface text-fg shadow-xs font-bold'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {opt.label}
                  {opt.count !== undefined && (
                    <span className="ml-1 text-[10px] text-fg-subtle font-normal">
                      ({opt.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {extraFilters}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table Surface */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-raised/70 border-b border-border text-fg-muted uppercase tracking-wider font-semibold">
              <tr>
                {columns.map((col, idx) => (
                  <th key={col.key || idx} className={`px-4 py-3 ${col.headerClassName || ''}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-fg-subtle" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-fg-muted">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-fg-muted">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-fg-subtle opacity-50" />
                    <p>{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr
                    key={row._id || row.id || rIdx}
                    className="hover:bg-surface-raised/50 transition-colors"
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || cIdx}
                        className={`px-4 py-3.5 align-middle ${col.className || ''}`}
                      >
                        {col.render ? col.render(row, rIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-raised/20 text-xs text-fg-muted">
            <div>
              Trang <span className="font-semibold text-fg">{pagination.page}</span> /{' '}
              <span className="font-semibold text-fg">{pagination.totalPages}</span> (Tổng{' '}
              {pagination.total} bản ghi)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    published: { label: 'Đã xuất bản', variant: 'success' },
    draft: { label: 'Bản nháp', variant: 'warning' },
    archived: { label: 'Đã lưu trữ', variant: 'secondary' },
    new: { label: 'Mới', variant: 'default' },
    in_review: { label: 'Đang xử lý', variant: 'warning' },
    replied: { label: 'Đã phản hồi', variant: 'success' },
    closed: { label: 'Đã đóng', variant: 'secondary' },
    spam: { label: 'Spam', variant: 'danger' },
  };

  const item = map[status] || { label: status || '—', variant: 'secondary' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
