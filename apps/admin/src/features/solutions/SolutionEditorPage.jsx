import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ImageField } from '../../components/media-picker/MediaPickerModal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function SolutionEditorPage() {
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

  useEffect(() => {
    if (!isNew) {
      loadSolution();
    }
  }, [id]);

  const loadSolution = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/solutions/${id}`);
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
      alert(err.message || 'Không thể tải thông tin giải pháp');
      navigate('/solutions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      name: form.title,
    };

    try {
      if (isNew) {
        await apiClient('/admin/solutions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient(`/admin/solutions/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      navigate('/solutions');
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu giải pháp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải pháp này?')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/solutions/${id}`, { method: 'DELETE' });
      navigate('/solutions');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa giải pháp');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin giải pháp...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm giải pháp mới' : 'Chỉnh sửa giải pháp'}
      subtitle="Thiết lập giải pháp phần mềm cho khách hàng doanh nghiệp."
      backUrl="/solutions"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => setForm({ ...form, status })}
    >
      <Card className="p-6 space-y-6">
        <LocalizedField
          label="Tên giải pháp"
          required
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />

        <LocalizedField
          label="Mô tả tóm tắt"
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
