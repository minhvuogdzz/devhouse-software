import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { isEmbeddableDemoUrl } from '@devhouse/shared';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ThumbnailsField } from '../../components/form/ThumbnailsField.jsx';
import { CategorySelect, MultiSelect } from '../../components/form/ReferenceSelect.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { RatingStars } from '../../components/form/RatingStars.jsx';
import { DemoUrlField, isDemoUrlValid } from '../../components/form/DemoUrlField.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';

const EMPTY_TEXT = { vi: '', en: '' };

/** Text in both languages. Older records may hold plain text or another shape, so tolerate them. */
function bilingual(value) {
  if (value && typeof value === 'object' && ('vi' in value || 'en' in value)) {
    return { vi: value.vi || '', en: value.en || '' };
  }
  return { vi: typeof value === 'string' ? value : '', en: '' };
}

const EMPTY = {
  title: EMPTY_TEXT,
  shortDescription: EMPTY_TEXT,
  description: EMPTY_TEXT,
  thumbnails: [],
  segment: null,
  category: null,
  rating: 0,
  views: 0,
  demoUrl: '',
  isFeatured: false,
  order: 0,
  client: { name: '', industry: EMPTY_TEXT, country: '', isConfidential: false },
  challenge: EMPTY_TEXT,
  solution: EMPTY_TEXT,
  results: [],
  services: [],
  technologies: [],
  status: 'draft',
  seo: { title: EMPTY_TEXT, description: EMPTY_TEXT },
};

export default function ProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState(EMPTY);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const res = await apiClient(`/admin/projects/${id}`);
        const d = res.data;
        setForm({
          ...EMPTY,
          ...d,
          title: bilingual(d.title),
          shortDescription: bilingual(d.shortDescription),
          description: bilingual(d.description),
          // Projects made before card pictures existed only have a cover image
          thumbnails: d.thumbnails?.length ? d.thumbnails : d.coverImage?.url ? [d.coverImage] : [],
          segment: d.segment || null,
          category: d.category || null,
          rating: d.rating ?? 0,
          views: d.views ?? 0,
          // The old "project link" becomes the demo link when it can be shown in a frame
          demoUrl: d.demoUrl || (isEmbeddableDemoUrl(d.projectUrl || '') ? d.projectUrl : ''),
          client: {
            name: d.client?.name || '',
            industry: bilingual(d.client?.industry),
            country: d.client?.country || '',
            isConfidential: !!d.client?.isConfidential,
          },
          challenge: bilingual(d.challenge),
          solution: bilingual(d.solution),
          results: (d.results || []).map(item => ({
            label: bilingual(item.label),
            value: bilingual(item.value),
            description: bilingual(item.description),
          })),
          services: (d.services || []).map(String),
          technologies: (d.technologies || []).map(String),
          seo: {
            title: bilingual(d.seo?.title),
            description: bilingual(d.seo?.description),
          },
        });
        setUpdatedAt(d.updatedAt);
      } catch (err) {
        alert(err.message || 'Không thể tải thông tin dự án');
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const set = patch => setForm(prev => ({ ...prev, ...patch }));
  const setClient = patch => setForm(prev => ({ ...prev, client: { ...prev.client, ...patch } }));
  const demoOk = isDemoUrlValid(form.demoUrl);

  const updateResult = (index, patch) =>
    set({
      results: form.results.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!demoOk) {
      setErrorMsg('Link demo phải bắt đầu bằng https://');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const payload = {
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      thumbnails: form.thumbnails.map(image => ({
        mediaId: image.mediaId,
        publicId: image.publicId || '',
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt || EMPTY_TEXT,
      })),
      segment: form.segment || null,
      category: form.category || null,
      rating: Number(form.rating) || 0,
      views: Math.max(0, parseInt(form.views, 10) || 0),
      demoUrl: form.demoUrl.trim(),
      isFeatured: form.isFeatured,
      order: parseInt(form.order, 10) || 0,
      client: form.client,
      challenge: form.challenge,
      solution: form.solution,
      results: form.results,
      services: form.services,
      technologies: form.technologies,
      status: form.status,
      seo: form.seo,
    };

    try {
      if (isNew) {
        await apiClient('/admin/projects', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiClient(`/admin/projects/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, updatedAt }),
        });
      }
      navigate('/projects');
    } catch (err) {
      const detail = Array.isArray(err.details) ? err.details.map(d => d.message).join('; ') : '';
      setErrorMsg([err.message, detail].filter(Boolean).join(': ') || 'Lỗi khi lưu dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xoá dự án này? Bạn có thể khôi phục lại sau.')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/projects/${id}`, { method: 'DELETE' });
      navigate('/projects');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xoá dự án');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm dự án mới' : 'Chỉnh sửa dự án'}
      subtitle="Thông tin này hiện trên thẻ dự án ở trang Dự án. Dự án chỉ hiện ở tiếng Anh khi bạn điền đủ tên và mô tả tiếng Anh."
      backUrl="/projects"
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
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Thông tin dự án</h3>
        <LocalizedField
          label="Tên dự án"
          required
          value={form.title}
          onChange={title => set({ title })}
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
            type="project-segment"
            value={form.segment}
            onChange={segment => set({ segment })}
          />
          <CategorySelect
            label="Thể loại (ví dụ: Website bán hàng, Landing page)"
            type="project"
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
            <RatingStars value={Number(form.rating) || 0} />
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

        <DemoUrlField value={form.demoUrl} onChange={demoUrl => set({ demoUrl })} />

        <Toggle
          label="Dự án nổi bật"
          hint="Dự án nổi bật được ưu tiên hiện ở trang chủ."
          checked={form.isFeatured}
          onChange={isFeatured => set({ isFeatured })}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-bold text-fg">Chi tiết dự án (không bắt buộc)</h3>
          <p className="text-xs text-fg-muted">
            Khách hàng, vấn đề và cách giải quyết. Chỉ hiện ở trang riêng của dự án khi có nội dung.
          </p>
        </div>

        <Toggle
          label="Ẩn tên khách hàng"
          hint="Tên và logo khách hàng không hiện ra ngoài; website ghi “Khách hàng giấu tên”."
          checked={form.client.isConfidential}
          onChange={isConfidential => setClient({ isConfidential })}
        />

        {!form.client.isConfidential && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Tên khách hàng"
              value={form.client.name}
              onChange={e => setClient({ name: e.target.value })}
            />
            <Input
              label="Quốc gia"
              value={form.client.country}
              onChange={e => setClient({ country: e.target.value })}
            />
          </div>
        )}

        <LocalizedField
          label="Lĩnh vực của khách hàng"
          value={form.client.industry}
          onChange={industry => setClient({ industry })}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LocalizedField
            label="Vấn đề cần giải quyết"
            type="textarea"
            rows={5}
            value={form.challenge}
            onChange={challenge => set({ challenge })}
          />
          <LocalizedField
            label="Cách chúng tôi giải quyết"
            type="textarea"
            rows={5}
            value={form.solution}
            onChange={solution => set({ solution })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-fg">Kết quả đạt được</h4>
              <p className="text-[11px] text-fg-subtle">
                Chỉ ghi số liệu có thật, ví dụ “2 tuần” với nhãn “Thời gian hoàn thành”.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.results.length >= 12}
              onClick={() =>
                set({
                  results: [
                    ...form.results,
                    { label: EMPTY_TEXT, value: EMPTY_TEXT, description: EMPTY_TEXT },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Thêm kết quả
            </Button>
          </div>

          {form.results.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-fg-muted">
              Chưa có kết quả nào.
            </p>
          ) : (
            form.results.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-surface-sunken p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fg">Kết quả {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => set({ results: form.results.filter((_, i) => i !== index) })}
                    className="cursor-pointer p-1 text-danger hover:text-danger/80"
                    aria-label="Xoá kết quả này"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <LocalizedField
                    label="Con số"
                    value={item.value}
                    onChange={value => updateResult(index, { value })}
                  />
                  <LocalizedField
                    label="Nhãn"
                    value={item.label}
                    onChange={label => updateResult(index, { label })}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <MultiSelect
          label="Dịch vụ liên quan"
          endpoint="/admin/services"
          value={form.services}
          onChange={services => set({ services })}
          getLabel={option => option.name?.vi || option.name?.en}
        />
        <MultiSelect
          label="Công nghệ sử dụng"
          endpoint="/admin/technologies"
          value={form.technologies}
          onChange={technologies => set({ technologies })}
          getLabel={option => option.name?.vi || option.name?.en || option.name}
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
    </ResourceForm>
  );
}
