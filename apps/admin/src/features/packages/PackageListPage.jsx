import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, RotateCcw, FileText } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { DataTable, StatusBadge } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';

const money = (value, currency) =>
  `${Number(value).toLocaleString('vi-VN')} ${currency === 'VND' ? '₫' : currency}`;

export function priceSummary(row) {
  const parts = [];
  if (row.setupFee != null) parts.push(`Cài đặt: ${money(row.setupFee, row.currency)}`);
  if (row.recurringFee != null) {
    parts.push(
      `Duy trì: ${money(row.recurringFee, row.currency)} / ${row.recurringPeriod === 'quarter' ? 'quý' : 'năm'}`,
    );
  }
  return parts;
}

export default function PackageListPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [pagination.page, statusFilter, search]);

  const load = async () => {
    try {
      setIsLoading(true);
      let query = `/admin/packages?page=${pagination.page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      const res = await apiClient(query);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Xoá gói này? Bạn có thể khôi phục lại sau.')) return;
    try {
      await apiClient(`/admin/packages/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      alert(err.message || 'Lỗi khi xoá gói');
    }
  };

  const handleRestore = async id => {
    try {
      await apiClient(`/admin/packages/${id}/restore`, { method: 'POST' });
      await load();
    } catch (err) {
      alert(err.message || 'Lỗi khi khôi phục gói');
    }
  };

  const columns = [
    {
      header: 'Gói',
      key: 'name',
      render: row => (
        <div>
          <Link
            to={`/packages/${row._id}`}
            className="text-xs font-bold text-fg transition-colors hover:text-primary"
          >
            {row.name?.vi || row.name?.en || '—'}
          </Link>
          <span className="block text-[11px] text-fg-subtle">{row.audience?.vi || ''}</span>
        </div>
      ),
    },
    {
      header: 'Giá',
      key: 'price',
      render: row => {
        const parts = priceSummary(row);
        return parts.length === 0 ? (
          <span className="text-xs text-fg-subtle">Chưa công bố (hiện “Liên hệ báo giá”)</span>
        ) : (
          <div className="space-y-0.5 text-xs tabular-nums text-fg-muted">
            {parts.map(part => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </div>
        );
      },
    },
    { header: 'Trạng thái', key: 'status', render: row => <StatusBadge status={row.status} /> },
    {
      header: 'Thứ tự',
      key: 'order',
      render: row => <span className="text-xs tabular-nums">{row.order ?? 0}</span>,
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          {row.isDeleted ? (
            <Button variant="outline" size="sm" onClick={() => handleRestore(row._id)}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Khôi phục
            </Button>
          ) : (
            <>
              <Button
                as={Link}
                to={`/packages/${row._id}`}
                variant="outline"
                size="sm"
                aria-label="Chỉnh sửa"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row._id)}
                aria-label="Xoá"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Gói dịch vụ</h1>
          <p className="mt-1 text-xs text-fg-muted">
            Các gói bạn bán: gồm gì, mức hỗ trợ và giá. Để trống giá nếu chưa công bố.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button as={Link} to="/pages/packages-index" variant="outline" size="md">
            <FileText className="mr-1.5 h-4 w-4" />
            Sửa tiêu đề & nội dung trang
          </Button>
          <Button as={Link} to="/packages/new" variant="primary" size="md">
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm gói mới
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={value => {
          setSearch(value);
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
        pagination={pagination}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        statusFilter={statusFilter}
        onStatusFilterChange={value => {
          setStatusFilter(value);
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
        statusOptions={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Bản nháp', value: 'draft' },
          { label: 'Đã xuất bản', value: 'published' },
          { label: 'Lưu trữ', value: 'archived' },
        ]}
        emptyMessage="Chưa có gói nào."
      />
    </div>
  );
}
