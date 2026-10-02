import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable, StatusBadge } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';

export default function SolutionListPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSolutions();
  }, [pagination.page, statusFilter]);

  const loadSolutions = async () => {
    try {
      setIsLoading(true);
      let query = `/admin/solutions?page=${pagination.page}&limit=10`;
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải pháp này?')) return;
    try {
      await apiClient(`/admin/solutions/${id}`, { method: 'DELETE' });
      await loadSolutions();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa giải pháp');
    }
  };

  const handleRestore = async id => {
    try {
      await apiClient(`/admin/solutions/${id}/restore`, { method: 'POST' });
      await loadSolutions();
    } catch (err) {
      alert(err.message || 'Lỗi khi khôi phục giải pháp');
    }
  };

  const columns = [
    {
      header: 'Tên giải pháp',
      key: 'name',
      render: row => (
        <div>
          <Link
            to={`/solutions/${row._id}`}
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
              <Button as={Link} to={`/solutions/${row._id}`} variant="outline" size="sm">
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
            Quản lý Giải pháp (Solutions)
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Gói giải pháp công nghệ toàn diện cho doanh nghiệp theo từng lĩnh vực chuyên môn.
          </p>
        </div>

        <Button as={Link} to="/solutions/new" variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm giải pháp mới
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
