import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable, StatusBadge } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';

export default function ServiceListPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [pagination.page, statusFilter]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      let query = `/admin/services?page=${pagination.page}&limit=10`;
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      await apiClient(`/admin/services/${id}`, { method: 'DELETE' });
      await loadServices();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa dịch vụ');
    }
  };

  const handleRestore = async id => {
    try {
      await apiClient(`/admin/services/${id}/restore`, { method: 'POST' });
      await loadServices();
    } catch (err) {
      alert(err.message || 'Lỗi khi khôi phục dịch vụ');
    }
  };

  const columns = [
    {
      header: 'Tên dịch vụ',
      key: 'name',
      render: row => (
        <div>
          <Link
            to={`/services/${row._id}`}
            className="font-bold text-fg hover:text-primary transition-colors text-xs"
          >
            {row.name?.vi || row.name?.en || row.title?.vi || row.title?.en || '—'}
          </Link>
          <span className="block text-[11px] text-fg-subtle">
            Slug: {typeof row.slug === 'object' ? row.slug.vi || row.slug.en : row.slug}
          </span>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      key: 'status',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      header: 'Thứ tự',
      key: 'order',
      render: row => <span className="font-mono text-xs">{row.order ?? 0}</span>,
    },
    {
      header: 'Cập nhật',
      key: 'updatedAt',
      render: row => (
        <span className="text-[11px] text-fg-subtle">
          {new Date(row.updatedAt || row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          {row.isDeleted ? (
            <Button variant="outline" size="sm" onClick={() => handleRestore(row._id)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Khôi phục
            </Button>
          ) : (
            <>
              <Button as={Link} to={`/services/${row._id}`} variant="outline" size="sm">
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
            Quản lý Dịch vụ (Services)
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Danh mục các dịch vụ kỹ thuật số và gói giải pháp phát triển phần mềm cốt lõi.
          </p>
        </div>

        <Button as={Link} to="/services/new" variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm dịch vụ mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        pagination={pagination}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Bản nháp', value: 'draft' },
          { label: 'Đã xuất bản', value: 'published' },
          { label: 'Lưu trữ', value: 'archived' },
        ]}
      />
    </div>
  );
}
