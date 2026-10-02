import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client.js';
import { DataTable } from '../../components/data-table/DataTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Plus, Edit, Trash2, User } from 'lucide-react';

export default function AuthorManagerPage() {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    role: { vi: '', en: '' },
    bio: { vi: '', en: '' },
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/admin/blog/authors');
      setAuthors(res.data || []);
    } catch {
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAuthor(null);
    setForm({ name: '', role: { vi: '', en: '' }, bio: { vi: '', en: '' } });
    setIsModalOpen(true);
  };

  const handleOpenEdit = author => {
    setEditingAuthor(author);
    setForm({
      name: author.name || '',
      role: author.role || { vi: '', en: '' },
      bio: author.bio || { vi: '', en: '' },
    });
    setIsModalOpen(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await apiClient(`/admin/blog/authors/${editingAuthor._id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient('/admin/blog/authors', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setIsModalOpen(false);
      await loadAuthors();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu tác giả');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tác giả này?')) return;
    try {
      await apiClient(`/admin/blog/authors/${id}`, { method: 'DELETE' });
      await loadAuthors();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa tác giả');
    }
  };

  const columns = [
    {
      header: 'Tác giả',
      key: 'name',
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-fg text-xs">{row.name}</span>
            <span className="block text-[11px] text-fg-subtle">
              {row.role?.vi || row.role?.en || 'Kỹ sư công nghệ'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tiểu sử',
      key: 'bio',
      render: row => (
        <span className="text-fg-muted text-xs line-clamp-1">
          {row.bio?.vi || row.bio?.en || '—'}
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
            Quản lý Tác giả Blog
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Hồ sơ tác giả, kỹ sư trưởng và chuyên gia kỹ thuật tham gia viết bài chia sẻ.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm tác giả mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={authors}
        isLoading={isLoading}
        emptyMessage="Chưa có tác giả nào."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu tác giả
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Họ và tên"
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <LocalizedField
            label="Chức danh / Vai trò"
            value={form.role}
            onChange={role => setForm({ ...form, role })}
          />

          <LocalizedField
            label="Tiểu sử tóm tắt (Bio)"
            type="textarea"
            rows={3}
            value={form.bio}
            onChange={bio => setForm({ ...form, bio })}
          />
        </form>
      </Modal>
    </div>
  );
}
