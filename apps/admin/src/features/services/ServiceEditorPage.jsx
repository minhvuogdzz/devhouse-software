import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ImageField } from '../../components/media-picker/MediaPickerModal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function ServiceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    title: { vi: '', en: '' },
    shortDescription: { vi: '', en: '' },
    order: 0,
    status: 'draft',
    coverImage: null,
    seo: { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isNew) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/services/${id}`);
      const d = res.data;
      setForm({
        title: d.title || d.name || { vi: '', en: '' },
        shortDescription: d.shortDescription || d.summary || { vi: '', en: '' },
        order: d.order ?? 0,
        status: d.status || 'draft',
        coverImage: d.coverImage || null,
        seo: d.seo || { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
      });
    } catch (err) {
      alert(err.message || 'Không thể tải thông tin dịch vụ');
      navigate('/services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      name: form.title, // sync name and title
    };

    try {
      setErrorMsg('');
      if (isNew) {
        await apiClient('/admin/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient(`/admin/services/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      navigate('/services');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu dịch vụ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/services/${id}`, { method: 'DELETE' });
      navigate('/services');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xóa dịch vụ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin dịch vụ...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
      subtitle="Thiết lập tên dịch vụ, tóm tắt và thứ tự hiển thị trên danh mục website."
      backUrl="/services"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => setForm({ ...form, status })}
    >
      {errorMsg && (
        <div className="p-4 rounded-lg bg-danger-surface text-danger text-sm font-medium">
          {errorMsg}
        </div>
      )}
      <Card className="p-6 space-y-6">
        <LocalizedField
          label="Tên dịch vụ"
          required
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />

        <LocalizedField
          label="Tóm tắt giới thiệu (Short description)"
          type="textarea"
          rows={3}
          value={form.shortDescription}
          onChange={shortDescription => setForm({ ...form, shortDescription })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Thứ tự hiển thị (Order)"
            type="number"
            value={form.order}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
          />

          <ImageField
            label="Hình ảnh đại diện"
            value={form.coverImage}
            onChange={coverImage => setForm({ ...form, coverImage })}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-fg border-b border-border pb-3">
          Tối ưu hóa Tìm kiếm (SEO Meta)
        </h3>
        <LocalizedField
          label="Tiêu đề SEO (Title)"
          value={form.seo?.title || { vi: '', en: '' }}
          onChange={title => setForm({ ...form, seo: { ...form.seo, title } })}
        />
        <LocalizedField
          label="Mô tả SEO (Description)"
          type="textarea"
          rows={2}
          value={form.seo?.description || { vi: '', en: '' }}
          onChange={description => setForm({ ...form, seo: { ...form.seo, description } })}
        />
      </Card>
    </ResourceForm>
  );
}
