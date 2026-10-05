import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, Play } from 'lucide-react';
import { isEmbeddableDemoUrl } from '@devhouse/shared';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ThumbnailsField } from '../../components/form/ThumbnailsField.jsx';
import { CategorySelect, MultiSelect } from '../../components/form/ReferenceSelect.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

const EMPTY = {
  name: { vi: '', en: '' },
  shortDescription: { vi: '', en: '' },
  description: { vi: '', en: '' },
  thumbnails: [],
  segment: null,
  category: null,
  rating: 0,
  views: 0,
  demoUrl: '',
  isFeatured: false,
  order: 0,
  packages: [],
  status: 'draft',
  seo: { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
};

function Stars({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`h-4 w-4 ${value >= n - 0.25 ? 'fill-warning text-warning' : 'text-border'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState(EMPTY);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const res = await apiClient(`/admin/products/${id}`);
        const d = res.data;
        setForm({
          ...EMPTY,
          ...d,
          name: d.name || EMPTY.name,
          shortDescription: d.shortDescription || EMPTY.shortDescription,
          description: d.description || EMPTY.description,
          thumbnails: d.thumbnails || [],
          packages: (d.packages || []).map(String),
          seo: {
            title: d.seo?.title || EMPTY.seo.title,
            description: d.seo?.description || EMPTY.seo.description,
          },
        });
        setUpdatedAt(d.updatedAt);
      } catch (err) {
        alert(err.message || 'Không thể tải mẫu');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const set = patch => setForm(prev => ({ ...prev, ...patch }));
  const demoOk = form.demoUrl === '' || isEmbeddableDemoUrl(form.demoUrl);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!demoOk) {
      setErrorMsg('Link demo phải bắt đầu bằng https://');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const payload = {
      name: form.name,
      shortDescription: form.shortDescription,
      description: form.description,
      thumbnails: form.thumbnails.map(image => ({
        mediaId: image.mediaId,
        publicId: image.publicId || '',
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt || { vi: '', en: '' },
      })),
      segment: form.segment || null,
      category: form.category || null,
      rating: Number(form.rating) || 0,
      views: Math.max(0, parseInt(form.views, 10) || 0),
      demoUrl: form.demoUrl.trim(),
      isFeatured: form.isFeatured,
      order: parseInt(form.order, 10) || 0,
      packages: form.packages,
      status: form.status,
      seo: form.seo,
    };

    try {
      if (isNew) {
        await apiClient('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiClient(`/admin/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, updatedAt }),
        });
      }
      navigate('/products');
    } catch (err) {
      const detail = Array.isArray(err.details) ? err.details.map(d => d.message).join('; ') : '';
      setErrorMsg([err.message, detail].filter(Boolean).join(': ') || 'Lỗi khi lưu mẫu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xoá mẫu này? Bạn có thể khôi phục lại sau.')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/products/${id}`, { method: 'DELETE' });
      navigate('/products');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xoá mẫu');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Đang tải thông tin mẫu...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm mẫu website mới' : 'Chỉnh sửa mẫu website'}
      subtitle="Thông tin này hiện trên thẻ mẫu ở trang Mẫu website. Mẫu chỉ hiện ở tiếng Anh khi bạn điền đủ tên và mô tả tiếng Anh."
      backUrl="/products"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => set({ status })}
    >
      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg bg-danger-subtle p-4 text-sm font-medium text-danger"
        >
          {errorMsg}
        </div>
      )}

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Thông tin mẫu</h3>
        <LocalizedField
          label="Tên mẫu"
          required
          value={form.name}
          onChange={name => set({ name })}
        />
        <LocalizedField
          label="Mô tả ngắn"
          type="textarea"
          rows={2}
          value={form.shortDescription}
          onChange={shortDescription => set({ shortDescription })}
        />
        <LocalizedField
          label="Mô tả chi tiết (tuỳ chọn)"
          type="textarea"
          rows={5}
          value={form.description}
          onChange={description => set({ description })}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Phân loại</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CategorySelect
            label="Mảng (ví dụ: Website, Game, Ứng dụng)"
            type="product-segment"
            value={form.segment}
            onChange={segment => set({ segment })}
          />
          <CategorySelect
            label="Thể loại (ví dụ: Website bán hàng, Landing page)"
            type="product"
            value={form.category}
            onChange={category => set({ category })}
          />
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Hình ảnh trên thẻ</h3>
        <ThumbnailsField
          label="Ảnh đại diện của thẻ (tỉ lệ 4:6)"
          value={form.thumbnails}
          onChange={thumbnails => set({ thumbnails })}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">
          Thông tin hiện khi rê chuột vào thẻ
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Input
              label="Đánh giá (0 đến 5 sao)"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={e => set({ rating: e.target.value })}
            />
            <Stars value={Number(form.rating) || 0} />
          </div>
          <Input
            label="Lượt xem"
            type="number"
            min="0"
            step="1"
            value={form.views}
            onChange={e => set({ views: e.target.value })}
          />
          <Input
            label="Thứ tự hiển thị (nhỏ hiện trước)"
            type="number"
            value={form.order}
            onChange={e => set({ order: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Input
            label="Link xem thử (demo)"
            placeholder="https://demo.tenmien.com"
            value={form.demoUrl}
            onChange={e => set({ demoUrl: e.target.value })}
            error={!demoOk ? 'Link demo phải bắt đầu bằng https://' : undefined}
            helperText="Khách xem demo ngay trong khung trên website, không bị chuyển sang trang khác."
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!form.demoUrl || !demoOk}
            onClick={() => setIsDemoOpen(true)}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Kiểm tra xem có hiện được trong khung không
          </Button>
          <p className="text-[11px] text-fg-subtle">
            Một số trang web chặn việc hiển thị trong khung nhúng. Nếu khung bên dưới trống, hãy
            dùng link khác.
          </p>
        </div>

        <Toggle
          label="Mẫu nổi bật"
          hint="Mẫu nổi bật được ưu tiên hiện ở trang chủ."
          checked={form.isFeatured}
          onChange={isFeatured => set({ isFeatured })}
        />

        <MultiSelect
          label="Phù hợp với các gói"
          endpoint="/admin/packages"
          value={form.packages}
          onChange={packages => set({ packages })}
          getLabel={option => option.name?.vi || option.name?.en}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">
          Tối ưu tìm kiếm (SEO)
        </h3>
        <LocalizedField
          label="Tiêu đề SEO"
          value={form.seo.title}
          onChange={title => set({ seo: { ...form.seo, title } })}
        />
        <LocalizedField
          label="Mô tả SEO"
          type="textarea"
          rows={2}
          value={form.seo.description}
          onChange={description => set({ seo: { ...form.seo, description } })}
        />
      </Card>

      <Modal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        title="Xem thử trong khung"
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => setIsDemoOpen(false)}>
            Đóng
          </Button>
        }
      >
        {isDemoOpen && (
          <iframe
            title="Xem thử demo"
            src={form.demoUrl}
            className="h-[60vh] w-full rounded-lg border border-border bg-surface"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </Modal>
    </ResourceForm>
  );
}
