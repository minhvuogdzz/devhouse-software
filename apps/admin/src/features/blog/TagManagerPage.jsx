import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client.js';
import { DataTable } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function TagManagerPage() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const [form, setForm] = useState({
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/admin/blog/tags');
      setTags(res.data || []);
    } catch {
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTag(null);
    setForm({ name: { vi: '', en: '' }, description: { vi: '', en: '' } });
    setIsModalOpen(true);
  };

  const handleOpenEdit = tag => {
    setEditingTag(tag);
    setForm({
      name: tag.name || { vi: '', en: '' },
      description: tag.description || { vi: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editingTag) {
        await apiClient(`/admin/blog/tags/${editingTag._id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient('/admin/blog/tags', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setIsModalOpen(false);
      await loadTags();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu thẻ');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      await apiClient(`/admin/blog/tags/${id}`, { method: 'DELETE' });
      await loadTags();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa thẻ');
    }
  };

  const columns = [
    {
      header: 'Tên thẻ tag',
      key: 'name',
      render: row => (
        <div>
          <span className="font-bold text-fg text-xs">{row.name?.vi || row.name?.en || '—'}</span>
          <span className="block text-[11px] text-fg-subtle">
            Slug: {typeof row.slug === 'object' ? row.slug.vi || row.slug.en : row.slug}
          </span>
        </div>
      ),
    },
    {
      header: 'Mô tả',
      key: 'description',
      render: row => (
        <span className="text-fg-muted text-xs">
          {row.description?.vi || row.description?.en || '—'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(row)}>
            <Edit className="w-3.5 h-3.5" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
            Quản lý Thẻ Tag Blog
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Gắn nhãn từ khóa và chủ đề cho các bài viết trong hệ thống.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm thẻ mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tags}
        isLoading={isLoading}
        emptyMessage="Chưa có thẻ tag nào."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Chỉnh sửa thẻ tag' : 'Thêm thẻ tag mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu thẻ
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <LocalizedField
            label="Tên thẻ tag"
            required
            value={form.name}
            onChange={name => setForm({ ...form, name })}
          />

          <LocalizedField
            label="Mô tả thẻ"
            type="textarea"
            rows={2}
            value={form.description}
            onChange={description => setForm({ ...form, description })}
          />
        </form>
      </Modal>
    </div>
  );
}
