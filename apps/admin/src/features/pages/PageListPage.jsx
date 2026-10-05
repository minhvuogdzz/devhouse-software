import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable } from '../../components/data-table/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  FileText,
  Edit,
  LayoutTemplate,
  Package as PackageIcon,
  Briefcase,
  Layers,
  Building2,
  Phone,
  Home,
  BookOpen,
  Users,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const PAGE_META = {
  'packages-index': {
    group: 'menu',
    menuLabel: 'Tab: Bảng Giá & Gói Cước',
    publicUrl: '/packages',
    icon: PackageIcon,
    summary:
      'Cấu hình Tiêu đề (Heading), Mô tả (Subheading), Phương thức thanh toán, Cam kết dịch vụ.',
  },
  'products-index': {
    group: 'menu',
    menuLabel: 'Tab: Mẫu website',
    publicUrl: '/products',
    icon: LayoutTemplate,
    summary:
      'Cấu hình Tiêu đề (Heading), Mô tả (Subheading), Trạng thái trống, Khung kêu gọi (CTA).',
  },
  'projects-index': {
    group: 'menu',
    menuLabel: 'Tab: Dự án',
    publicUrl: '/projects',
    icon: Briefcase,
    summary:
      'Cấu hình Tiêu đề (Heading), Mô tả ngắn (Subheading) trang danh mục dự án & case study.',
  },
  'services-index': {
    group: 'menu',
    menuLabel: 'Tab: Dịch vụ',
    publicUrl: '/services',
    icon: Layers,
    summary: 'Cấu hình Tiêu đề (Heading), Mô tả (Subheading), Khung kêu gọi hành động (CTA).',
  },
  about: {
    group: 'menu',
    menuLabel: 'Tab: Về Dev House',
    publicUrl: '/about',
    icon: Building2,
    summary:
      'Giới thiệu công ty, ảnh slide, tầm nhìn, việc công ty làm, giá trị, điều khoản dịch vụ. Bật/tắt từng khối và chọn kiểu hiển thị.',
  },
  contact: {
    group: 'menu',
    menuLabel: 'Tab: Liên hệ',
    publicUrl: '/contact',
    icon: Phone,
    summary:
      'Cấu hình Tiêu đề (Heading), Mô tả (Subheading), Lời chào và hướng dẫn gửi yêu cầu tư vấn.',
  },
  'service-detail': {
    group: 'core',
    menuLabel: 'Trang từng dịch vụ',
    publicUrl: '/services/...',
    icon: Layers,
    summary:
      'Tiêu đề các phần và cách hiển thị (lưới, danh sách, trượt) trên trang của từng dịch vụ: dạng dịch vụ trong nhóm, điểm nổi bật, các bước triển khai.',
  },
  'project-detail': {
    group: 'core',
    menuLabel: 'Trang từng dự án',
    publicUrl: '/projects/...',
    icon: Briefcase,
    summary:
      'Cách hiển thị (lưới, danh sách, trượt) của kết quả và tính năng trên trang từng dự án.',
  },
  home: {
    group: 'core',
    menuLabel: 'Trang chủ (Home)',
    publicUrl: '/',
    icon: Home,
    summary:
      'Đầu trang, cam kết, dịch vụ, mẫu website, dành cho ai, gói dịch vụ, quy trình, kêu gọi hành động. Bật/tắt từng khối và chọn kiểu hiển thị.',
  },
  'blog-index': {
    group: 'core',
    menuLabel: 'Trang Blog / Tin tức',
    publicUrl: '/blog',
    icon: BookOpen,
    summary: 'Tiêu đề (Heading) & Giới thiệu danh mục các bài viết chia sẻ công nghệ.',
  },
  careers: {
    group: 'core',
    menuLabel: 'Trang Tuyển dụng',
    publicUrl: '/careers',
    icon: Users,
    summary: 'Tiêu đề, Môi trường làm việc, Quyền lợi ứng viên.',
  },
  privacy: {
    group: 'legal',
    menuLabel: 'Chính sách bảo mật',
    publicUrl: '/privacy',
    icon: ShieldAlert,
    summary: 'Văn bản cam kết và chính sách bảo mật dữ liệu khách hàng.',
  },
  terms: {
    group: 'legal',
    menuLabel: 'Điều khoản dịch vụ',
    publicUrl: '/terms',
    icon: FileText,
    summary: 'Quy định và các điều khoản sử dụng & cung cấp dịch vụ phần mềm.',
  },
  'not-found': {
    group: 'legal',
    menuLabel: 'Trang 404 (Không tìm thấy)',
    publicUrl: '/404',
    icon: AlertCircle,
    summary: 'Tiêu đề thông báo và nút điều hướng khi người dùng truy cập link hỏng.',
  },
};

export default function PageListPage() {
  const [pages, setPages] = useState([]);
  const [activeGroup, setActiveGroup] = useState('menu');
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

  const filteredPages = pages.filter(p => {
    if (activeGroup === 'all') return true;
    const meta = PAGE_META[p.key];
    return meta?.group === activeGroup;
  });

  const columns = [
    {
      header: 'Tên trang & Tab trên Menu',
      key: 'title',
      render: row => {
        const meta = PAGE_META[row.key] || {
          group: 'other',
          menuLabel: 'Trang phụ',
          publicUrl: '',
          icon: FileText,
          summary: 'Nội dung trang.',
        };
        const Icon = meta.icon;
        const viTitle = typeof row.title === 'object' ? row.title.vi : row.title;
        const enTitle = typeof row.title === 'object' ? row.title.en : '';

        return (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/pages/${row.key}`}
                  className="font-bold text-fg hover:text-primary transition-colors text-sm"
                >
                  {viTitle || row.key}
                </Link>
                {enTitle && <span className="text-xs text-fg-subtle">({enTitle})</span>}
                <Badge variant={meta.group === 'menu' ? 'primary' : 'secondary'} size="sm">
                  {meta.menuLabel}
                </Badge>
              </div>
              <p className="text-xs text-fg-muted leading-relaxed line-clamp-2 max-w-xl">
                {meta.summary}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-fg-subtle pt-0.5">
                <span>
                  Key: <code className="font-semibold text-fg-muted">{row.key}</code>
                </span>
                {meta.publicUrl && (
                  <span className="inline-flex items-center gap-1 text-primary hover:underline">
                    <span>URL web: {meta.publicUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Trạng thái nội dung',
      key: 'overriddenSections',
      render: row => {
        const count = row.overriddenSections?.length || 0;
        return (
          <Badge variant={count > 0 ? 'success' : 'secondary'}>
            {count > 0 ? `Đã tùy biến (${count} phần)` : 'Mặc định hệ thống'}
          </Badge>
        );
      },
    },
    {
      header: 'Cập nhật',
      key: 'updatedAt',
      render: row => (
        <span className="text-fg-subtle text-[11px] tabular-nums">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-2">
          <Button as={Link} to={`/pages/${row.key}`} variant="primary" size="sm">
            <Edit className="w-3.5 h-3.5 mr-1" />
            Sửa Heading & Text
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
          Nội dung các Trang (Heading, Subheading & Văn bản)
        </h1>
        <p className="text-xs text-fg-muted mt-1 leading-relaxed">
          Tùy chỉnh tiêu đề chính (Heading), mô tả ngắn (Subheading), lời giới thiệu và các khung
          kêu gọi hành động (CTA) cho từng tab trên thanh menu website bằng cả 2 ngôn ngữ (Tiếng
          Việt & English).
        </p>
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary-subtle/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-fg">
            Tất cả các Tab trên thanh Menu website đều có thể chỉnh sửa nội dung tại đây:
          </p>
          <p className="text-fg-muted">
            Chọn tab tương ứng (Mẫu website, Bảng Giá & Gói Cước, Dự án, Dịch vụ, Về Dev House, Liên
            hệ) rồi bấm <strong>"Sửa Heading & Text"</strong> để thay đổi chữ hiển thị ngoài trang
            web theo ý bạn.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveGroup('menu')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeGroup === 'menu'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
          }`}
        >
          🌟 Tab trên Menu chính ({pages.filter(p => PAGE_META[p.key]?.group === 'menu').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('core')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeGroup === 'core'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
          }`}
        >
          Trang chủ & Bài viết ({pages.filter(p => PAGE_META[p.key]?.group === 'core').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('legal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeGroup === 'legal'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
          }`}
        >
          Pháp lý & Hệ thống ({pages.filter(p => PAGE_META[p.key]?.group === 'legal').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeGroup === 'all'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
          }`}
        >
          Tất cả ({pages.length})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredPages}
        isLoading={isLoading}
        emptyMessage="Chưa có trang nào trong mục này."
      />
    </div>
  );
}
