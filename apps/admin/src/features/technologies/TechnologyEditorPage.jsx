import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function TechnologyEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    name: '',
    description: { vi: '', en: '' },
    websiteUrl: '',
    order: 0,
    status: 'published',
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadTech();
    }
  }, [id]);

  const loadTech = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/technologies/${id}`);
      const d = res.data;
      setForm({
        name: d.name || '',
        description: d.description || { vi: '', en: '' },
        websiteUrl: d.websiteUrl || '',
        order: d.order ?? 0,
        status: d.status || 'published',
      });
    } catch (err) {
      alert(err.message || 'Không thể tải thông tin công nghệ');
      navigate('/technologies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isNew) {
        await apiClient('/admin/technologies', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient(`/admin/technologies/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      }
      navigate('/technologies');
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu công nghệ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công nghệ này?')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/technologies/${id}`, { method: 'DELETE' });
      navigate('/technologies');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa công nghệ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin công nghệ...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm công nghệ mới' : 'Chỉnh sửa công nghệ'}
      subtitle="Thiết lập tên công nghệ, mô tả tóm tắt bằng ngôn ngữ kinh doanh thông thường và liên kết tài liệu."
      backUrl="/technologies"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => setForm({ ...form, status })}
    >
      <Card className="p-6 space-y-6">
        <Input
          label="Tên công nghệ (Name)"
          required
          placeholder="Ví dụ: React, Node.js, PostgreSQL..."
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <LocalizedField
          label="Mô tả công nghệ (Plain business language)"
          required
          type="textarea"
          rows={3}
          value={form.description}
          onChange={description => setForm({ ...form, description })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Liên kết website chính thức (URL)"
            type="url"
            placeholder="https://..."
            value={form.websiteUrl}
            onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
          />

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={form.order}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </Card>
    </ResourceForm>
  );
}
