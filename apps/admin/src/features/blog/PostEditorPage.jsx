import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ImageField } from '../../components/media-picker/MediaPickerModal.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    title: { vi: '', en: '' },
    excerpt: { vi: '', en: '' },
    content: { vi: '', en: '' },
    author: '',
    status: 'draft',
    publishedAt: '',
    isFeatured: false,
    coverImage: null,
    seo: { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
  });

  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAuthors();
    if (!isNew) {
      loadPost();
    }
  }, [id]);

  const loadAuthors = async () => {
    try {
      const res = await apiClient('/admin/blog/authors');
      setAuthors(res.data || []);
      if (res.data?.length > 0 && !form.author) {
        setForm(prev => ({ ...prev, author: res.data[0]._id }));
      }
    } catch {
      /* ignore load author failure */
    }
  };

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/blog/posts/${id}`);
      const d = res.data;
      setForm({
        title: d.title || { vi: '', en: '' },
        excerpt: d.excerpt || { vi: '', en: '' },
        content: d.content || { vi: '', en: '' },
        author: d.author?._id || d.author || '',
        status: d.status || 'draft',
        publishedAt: d.publishedAt ? new Date(d.publishedAt).toISOString().slice(0, 16) : '',
        isFeatured: !!d.isFeatured,
        coverImage: d.coverImage || null,
        seo: d.seo || { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
      });
    } catch (err) {
      alert(err.message || 'Không thể tải bài viết');
      navigate('/blog/posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    };

    try {
      if (isNew) {
        await apiClient('/admin/blog/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient(`/admin/blog/posts/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      navigate('/blog/posts');
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/blog/posts/${id}`, { method: 'DELETE' });
      navigate('/blog/posts');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa bài viết');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin bài viết...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}
      subtitle="Soạn thảo nội dung kỹ thuật song ngữ. Hệ thống tự động tính toán thời gian đọc và trích đoạn."
      backUrl="/blog/posts"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => setForm({ ...form, status })}
    >
      <Card className="p-6 space-y-6">
        <LocalizedField
          label="Tiêu đề bài viết"
          required
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />

        <LocalizedField
          label="Tóm tắt bài viết (Excerpt - Tự động trích xuất nếu để trống)"
          type="textarea"
          rows={2}
          value={form.excerpt}
          onChange={excerpt => setForm({ ...form, excerpt })}
        />

        <LocalizedField
          label="Nội dung bài viết (Markdown / Văn bản)"
          required
          type="textarea"
          rows={12}
          value={form.content}
          onChange={content => setForm({ ...form, content })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Tác giả"
            value={form.author}
            onChange={e => setForm({ ...form, author: e.target.value })}
          >
            <option value="">-- Chọn tác giả --</option>
            {authors.map(a => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </Select>

          <Input
            label="Lên lịch xuất bản (Published at)"
            type="datetime-local"
            value={form.publishedAt}
            onChange={e => setForm({ ...form, publishedAt: e.target.value })}
          />

          <ImageField
            label="Ảnh minh họa bài viết"
            value={form.coverImage}
            onChange={coverImage => setForm({ ...form, coverImage })}
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-fg">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Đánh dấu là bài viết nổi bật (Featured Post)</span>
          </label>
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
