import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, RotateCcw, Star, Eye, ImageOff } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { DataTable, StatusBadge } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Input.jsx';

export default function ProductListPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient('/admin/categories?type=product-segment'),
      apiClient('/admin/categories?type=product'),
    ])
      .then(([seg, cat]) => {
        setSegments(seg.data || []);
        setCategories(cat.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [pagination.page, statusFilter, segmentFilter, search]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      let query = `/admin/products?page=${pagination.page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      if (segmentFilter) query += `&segment=${segmentFilter}`;
      const res = await apiClient(query);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const nameOf = (list, id) => {
    const found = list.find(item => item._id === id);
    return found?.name?.vi || found?.name?.en || '—';
  };

  const handleDelete = async id => {
    if (!window.confirm('Xoá mẫu này? Bạn có thể khôi phục lại sau.')) return;
    try {
      await apiClient(`/admin/products/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (err) {
      alert(err.message || 'Lỗi khi xoá mẫu');
    }
  };

  const handleRestore = async id => {
    try {
      await apiClient(`/admin/products/${id}/restore`, { method: 'POST' });
      await loadProducts();
    } catch (err) {
      alert(err.message || 'Lỗi khi khôi phục mẫu');
    }
  };

  const columns = [
    {
      header: 'Mẫu',
      key: 'name',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-sunken">
            {row.thumbnails?.[0]?.url ? (
              <img src={row.thumbnails[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-fg-subtle">
                <ImageOff className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <Link
              to={`/products/${row._id}`}
              className="text-xs font-bold text-fg transition-colors hover:text-primary"
            >
              {row.name?.vi || row.name?.en || '—'}
            </Link>
            <span className="block text-[11px] text-fg-subtle">
              {row.locales?.includes('en') ? 'VI + EN' : 'Chỉ có tiếng Việt'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Mảng / Thể loại',
      key: 'taxonomy',
      render: row => (
        <div className="text-xs">
          <span className="block font-semibold text-fg">{nameOf(segments, row.segment)}</span>
          <span className="block text-fg-subtle">{nameOf(categories, row.category)}</span>
        </div>
      ),
    },
    {
      header: 'Đánh giá / Lượt xem',
      key: 'stats',
      render: row => (
        <div className="space-y-0.5 text-xs tabular-nums text-fg-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
            {Number(row.rating || 0).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {Number(row.views || 0).toLocaleString('vi-VN')}
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
                to={`/products/${row._id}`}
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Mẫu website</h1>
          <p className="mt-1 text-xs text-fg-muted">
            Các thẻ mẫu hiện ở trang Mẫu website: ảnh, thể loại, đánh giá, lượt xem và bản xem thử.
          </p>
        </div>
        <Button as={Link} to="/products/new" variant="primary" size="md">
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm mẫu mới
        </Button>
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
        extraFilters={
          <div className="w-44">
            <Select
              aria-label="Lọc theo mảng"
              value={segmentFilter}
              onChange={e => {
                setSegmentFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">Mọi mảng</option>
              {segments.map(segment => (
                <option key={segment._id} value={segment._id}>
                  {segment.name?.vi || segment.name?.en}
                </option>
              ))}
            </Select>
          </div>
        }
        emptyMessage="Chưa có mẫu nào. Bấm “Thêm mẫu mới” để tạo mẫu đầu tiên."
      />
    </div>
  );
}
