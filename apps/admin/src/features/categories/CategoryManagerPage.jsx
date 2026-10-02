import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { DataTable } from '../../components/data-table/DataTable.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoryManagerPage() {
  const { type: rawType } = useParams();
  const navigate = useNavigate();
  const activeType = rawType || 'service';

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
    order: 0,
  });

  const categoryTypes = [
    { id: 'service', label: 'Dịch vụ (Service)' },
    { id: 'solution', label: 'Giải pháp (Solution)' },
    { id: 'technology', label: 'Công nghệ (Technology)' },
    { id: 'post', label: 'Bài viết (Blog)' },
  ];

  useEffect(() => {
    loadCategories();
  }, [activeType]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/categories?type=${activeType}`);
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({
      name: { vi: '', en: '' },
      description: { vi: '', en: '' },
      order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = item => {
    setEditingCategory(item);
    setForm({
      name: item.name || { vi: '', en: '' },
      description: item.description || { vi: '', en: '' },
      order: item.order ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiClient(`/admin/categories/${editingCategory._id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient('/admin/categories', {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            type: activeType,
          }),
        });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await apiClient(`/admin/categories/${id}`, { method: 'DELETE' });
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Không thể xóa danh mục đang có mục con liên kết.');
    }
  };

  const columns = [
    {
      header: 'Tên danh mục',
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
        <span className="text-fg-muted text-xs line-clamp-1">
          {row.description?.vi || row.description?.en || '—'}
        </span>
      ),
    },
    {
      header: 'Thứ tự',
      key: 'order',
      render: row => <span className="font-mono text-xs">{row.order ?? 0}</span>,
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
            Quản lý Danh mục (Categories)
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Phân loại dịch vụ, giải pháp, công nghệ và bài viết blog theo từng nhóm chuyên biệt.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm danh mục mới
        </Button>
      </div>

      <Tabs
        tabs={categoryTypes}
        activeTab={activeType}
        onChange={tabId => navigate(`/categories/${tabId}`)}
      />

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage={`Chưa có danh mục nào thuộc nhóm "${activeType}".`}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu danh mục
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <LocalizedField
            label="Tên danh mục"
            required
            value={form.name}
            onChange={name => setForm({ ...form, name })}
          />

          <LocalizedField
            label="Mô tả danh mục"
            type="textarea"
            rows={2}
            value={form.description}
            onChange={description => setForm({ ...form, description })}
          />

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={form.order}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
          />
        </form>
      </Modal>
    </div>
  );
}
