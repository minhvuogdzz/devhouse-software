import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ListField } from '../../components/form/ListField.jsx';
import { IconSelect } from '../../components/form/IconSelect.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { ImageField } from '../../components/media-picker/MediaPickerModal.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

const blank = () => ({ vi: '', en: '' });

const EMPTY = {
  name: blank(),
  shortDescription: blank(),
  description: blank(),
  icon: 'layout',
  billing: 'recurring',
  image: null,
  features: [],
  faqs: [],
  order: 0,
  isFeatured: false,
  status: 'draft',
  seo: { title: blank(), description: blank() },
};

export default function ServiceEditorPage() {
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
        const res = await apiClient(`/admin/services/${id}`);
        const d = res.data;
        setForm({
          ...EMPTY,
          ...d,
          name: d.name || blank(),
          shortDescription: d.shortDescription || blank(),
          description: d.description || blank(),
          image: d.image?.url ? d.image : null,
          features: d.features || [],
          faqs: d.faqs || [],
          seo: { title: d.seo?.title || blank(), description: d.seo?.description || blank() },
        });
        setUpdatedAt(d.updatedAt);
      } catch (err) {
        alert(err.message || 'Không thể tải thông tin dịch vụ');
        navigate('/services');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const set = patch => setForm(prev => ({ ...prev, ...patch }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    const payload = {
      name: form.name,
      shortDescription: form.shortDescription,
      description: form.description,
      icon: form.icon,
      billing: form.billing,
      image: form.image?.url
        ? {
            mediaId: form.image.mediaId,
            publicId: form.image.publicId || '',
            url: form.image.url,
            width: form.image.width,
            height: form.image.height,
            alt: form.image.alt || blank(),
          }
        : null,
      features: form.features,
      faqs: form.faqs,
      order: parseInt(form.order, 10) || 0,
      isFeatured: form.isFeatured,
      status: form.status,
      seo: form.seo,
    };
    try {
      if (isNew) {
        await apiClient('/admin/services', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiClient(`/admin/services/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, updatedAt }),
        });
      }
      navigate('/services');
    } catch (err) {
      const detail = Array.isArray(err.details) ? err.details.map(d => d.message).join('; ') : '';
      setErrorMsg([err.message, detail].filter(Boolean).join(': ') || 'Lỗi khi lưu dịch vụ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xoá dịch vụ này? Bạn có thể khôi phục lại sau.')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/services/${id}`, { method: 'DELETE' });
      navigate('/services');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xoá dịch vụ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Đang tải thông tin dịch vụ...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
      subtitle="Mỗi dịch vụ có trang riêng trên website. Dịch vụ chỉ hiện ở tiếng Anh khi bạn điền đủ tên và mô tả tiếng Anh."
      backUrl="/services"
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
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Thông tin dịch vụ</h3>
        <LocalizedField
          label="Tên dịch vụ"
          required
          value={form.name}
          onChange={name => set({ name })}
        />
        <LocalizedField
          label="Mô tả ngắn (hiện trên thẻ)"
          type="textarea"
          rows={2}
          value={form.shortDescription}
          onChange={shortDescription => set({ shortDescription })}
        />
        <LocalizedField
          label="Mô tả đầy đủ (hiện trên trang chi tiết)"
          type="textarea"
          rows={6}
          value={form.description}
          onChange={description => set({ description })}
        />
        <IconSelect label="Biểu tượng" value={form.icon} onChange={icon => set({ icon })} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            label="Cách thu phí"
            value={form.billing}
            onChange={e => set({ billing: e.target.value })}
          >
            <option value="one_time">Thu một lần (phí cài đặt)</option>
            <option value="recurring">Phí duy trì định kỳ (quý hoặc năm)</option>
            <option value="yearly">Thu theo năm</option>
          </Select>
          <Input
            label="Thứ tự hiển thị (nhỏ hiện trước)"
            type="number"
            value={form.order}
            onChange={e => set({ order: e.target.value })}
          />
        </div>
        <ImageField
          label="Ảnh minh hoạ (tuỳ chọn)"
          value={form.image}
          onChange={image => set({ image })}
        />
        <Toggle
          label="Dịch vụ nổi bật"
          hint="Ưu tiên hiển thị ở trang chủ."
          checked={form.isFeatured}
          onChange={isFeatured => set({ isFeatured })}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Điểm nổi bật</h3>
        <ListField
          items={form.features}
          onChange={features => set({ features })}
          createItem={() => ({ title: blank(), description: blank() })}
          addLabel="Thêm điểm nổi bật"
          emptyText="Chưa có điểm nổi bật nào."
          itemTitle={(item, index) => `${index + 1}. ${item.title?.vi || 'Điểm mới'}`}
          renderItem={(item, setItem) => (
            <>
              <LocalizedField
                label="Tiêu đề"
                value={item.title}
                onChange={title => setItem({ ...item, title })}
              />
              <LocalizedField
                label="Mô tả"
                type="textarea"
                rows={2}
                value={item.description}
                onChange={description => setItem({ ...item, description })}
              />
            </>
          )}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">
          Câu hỏi thường gặp
        </h3>
        <ListField
          items={form.faqs}
          onChange={faqs => set({ faqs })}
          createItem={() => ({ question: blank(), answer: blank() })}
          addLabel="Thêm câu hỏi"
          emptyText="Chưa có câu hỏi nào."
          itemTitle={(item, index) => `${index + 1}. ${item.question?.vi || 'Câu hỏi mới'}`}
          renderItem={(item, setItem) => (
            <>
              <LocalizedField
                label="Câu hỏi"
                value={item.question}
                onChange={question => setItem({ ...item, question })}
              />
              <LocalizedField
                label="Trả lời"
                type="textarea"
                rows={3}
                value={item.answer}
                onChange={answer => setItem({ ...item, answer })}
              />
            </>
          )}
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
