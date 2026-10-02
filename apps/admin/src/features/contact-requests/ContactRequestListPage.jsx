import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable, StatusBadge } from '../../components/data-table/DataTable.jsx';
import { Eye, Trash2 } from 'lucide-react';

export default function ContactRequestListPage() {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      let query = `/admin/contact-requests?limit=50`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await apiClient(query);
      setData(res.data || []);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu liên hệ này?')) return;
    try {
      await apiClient(`/admin/contact-requests/${id}`, { method: 'DELETE' });
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa yêu cầu');
    }
  };

  const columns = [
    {
      header: 'Người gửi',
      key: 'name',
      render: row => (
        <div>
          <Link
            to={`/contact-requests/${row._id}`}
            className="font-bold text-fg hover:text-primary transition-colors text-xs"
          >
            {row.name}
          </Link>
          <span className="block text-[11px] text-fg-subtle">
            {row.email} {row.company ? `• ${row.company}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Dịch vụ quan tâm',
      key: 'service',
      render: row => (
        <span className="text-xs text-fg-muted font-medium">{row.service || 'Tư vấn chung'}</span>
      ),
    },
    {
      header: 'Trạng thái',
      key: 'status',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      header: 'Thời gian gửi',
      key: 'createdAt',
      render: row => (
        <span className="text-[11px] text-fg-subtle">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          <Button as={Link} to={`/contact-requests/${row._id}`} variant="outline" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
          Hộp thư Yêu cầu Tư vấn (Leads)
        </h1>
        <p className="text-xs text-fg-muted mt-1">
          Theo dõi và phản hồi các yêu cầu liên hệ hợp tác từ khách hàng gửi qua website.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Mới', value: 'new' },
          { label: 'Đang xử lý', value: 'in_review' },
          { label: 'Đã phản hồi', value: 'replied' },
          { label: 'Đã đóng', value: 'closed' },
          { label: 'Spam', value: 'spam' },
        ]}
      />
    </div>
  );
}
