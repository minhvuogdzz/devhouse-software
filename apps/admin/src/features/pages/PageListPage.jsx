import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable } from '../../components/data-table/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { FileText, Edit } from 'lucide-react';

export default function PageListPage() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/admin/pages');
      setPages(res.data || []);
    } catch {
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: 'Tên trang',
      key: 'title',
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <Link
              to={`/content/pages/${row.key}`}
              className="font-bold text-fg hover:text-primary transition-colors text-xs"
            >
              {typeof row.title === 'object' ? row.title.vi || row.title.en : row.title}
            </Link>
            <span className="block text-[11px] text-fg-subtle">
              Key: <span className="font-semibold text-fg-muted">{row.key}</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Trạng thái ghi đè',
      key: 'hasOverrides',
      render: row => (
        <Badge variant={row.hasOverrides ? 'success' : 'secondary'}>
          {row.hasOverrides ? 'Đã tùy biến' : 'Mặc định code'}
        </Badge>
      ),
    },
    {
      header: 'Cập nhật lần cuối',
      key: 'updatedAt',
      render: row => (
        <span className="text-fg-subtle text-[11px]">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-2">
          <Button as={Link} to={`/content/pages/${row.key}`} variant="outline" size="sm">
            <Edit className="w-3.5 h-3.5 mr-1" />
            Chỉnh sửa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
          Quản lý Trang Tĩnh & Nội dung Độc lập
        </h1>
        <p className="text-xs text-fg-muted mt-1">
          Chỉnh sửa nội dung các trang cố định (Trang chủ, Giới thiệu, Tuyển dụng, Liên hệ...) dựa
          trên các Section định nghĩa sẵn.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pages}
        isLoading={isLoading}
        emptyMessage="Chưa có trang nào trong hệ thống."
      />
    </div>
  );
}
