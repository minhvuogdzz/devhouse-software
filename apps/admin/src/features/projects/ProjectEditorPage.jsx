import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function ProjectEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    title: { vi: '', en: '' },
    shortDescription: { vi: '', en: '' },
    client: {
      name: '',
      industry: { vi: '', en: '' },
      country: '',
      isConfidential: false,
    },
    challenge: { vi: '', en: '' },
    solution: { vi: '', en: '' },
    results: [],
    projectUrl: '',
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
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/projects/${id}`);
      const d = res.data;
      setForm({
        title: d.title || { vi: '', en: '' },
        shortDescription: d.shortDescription || { vi: '', en: '' },
        client: {
          name: d.client?.name || '',
          industry: d.client?.industry || { vi: '', en: '' },
          country: d.client?.country || '',
          isConfidential: !!d.client?.isConfidential,
        },
        challenge:
          typeof d.challenge === 'object' && d.challenge !== null
            ? d.challenge
            : { vi: '', en: '' },
        solution:
          typeof d.solution === 'object' && d.solution !== null ? d.solution : { vi: '', en: '' },
        results: Array.isArray(d.results) ? d.results : [],
        projectUrl: d.projectUrl || '',
        order: d.order ?? 0,
        status: d.status || 'draft',
        coverImage: d.coverImage || null,
        seo: d.seo || { title: { vi: '', en: '' }, description: { vi: '', en: '' } },
      });
    } catch (err) {
      alert(err.message || 'Không thể tải thông tin dự án');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const addResultMetric = () => {
    setForm({
      ...form,
      results: [
        ...form.results,
        {
          value: { vi: '', en: '' },
          label: { vi: '', en: '' },
          description: { vi: '', en: '' },
        },
      ],
    });
  };

  const removeResultMetric = index => {
    setForm({
      ...form,
      results: form.results.filter((_, idx) => idx !== index),
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isNew) {
        await apiClient('/admin/projects', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient(`/admin/projects/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      }
      navigate('/projects');
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/projects/${id}`, { method: 'DELETE' });
      navigate('/projects');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa dự án');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm dự án mới' : 'Chỉnh sửa dự án'}
      subtitle="Thiết lập nội dung case study, thách thức, giải pháp và kết quả định lượng."
      backUrl="/projects"
      onSubmit={handleSubmit}
      onDelete={!isNew ? handleDelete : null}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      status={form.status}
      onStatusChange={status => setForm({ ...form, status })}
    >
      {/* Basic information */}
      <Card className="p-6 space-y-6">
        <LocalizedField
          label="Tên dự án"
          required
          value={form.title}
          onChange={title => setForm({ ...form, title })}
        />

        <LocalizedField
          label="Tóm tắt ngắn (Short description)"
          type="textarea"
          rows={3}
          value={form.shortDescription}
          onChange={shortDescription => setForm({ ...form, shortDescription })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={form.order}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
          />

          <Input
            label="URL liên kết trực tiếp (nếu có)"
            type="url"
            placeholder="https://client-product.com"
            value={form.projectUrl}
            onChange={e => setForm({ ...form, projectUrl: e.target.value })}
          />
        </div>
      </Card>

      {/* Client & Confidentiality */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-fg">Thông tin Khách hàng & Tính Bảo mật</h3>
            <p className="text-xs text-fg-muted">
              Quy định cách thông tin đối tác được hiển thị ra công chúng.
            </p>
          </div>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={form.client.isConfidential}
              onChange={e =>
                setForm({
                  ...form,
                  client: { ...form.client, isConfidential: e.target.checked },
                })
              }
              className="rounded border-border text-primary focus:ring-primary"
            />
            <ShieldCheck className="w-4 h-4 text-fg-muted" />
            <span>Khách hàng bảo mật (Ẩn danh)</span>
          </label>
        </div>

        {form.client.isConfidential ? (
          <div className="p-4 rounded-xl bg-surface-sunken text-xs text-fg-muted leading-relaxed">
            <p className="font-semibold text-fg">Chế độ Bảo mật đang BẬT:</p>
            <p>
              Tên doanh nghiệp và logo sẽ hoàn toàn bị ẩn khỏi trang chi tiết và danh mục công khai.
              Giao diện người dùng sẽ hiển thị nhãn chuẩn <strong>"Khách hàng bảo mật"</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên khách hàng"
              value={form.client.name}
              onChange={e =>
                setForm({
                  ...form,
                  client: { ...form.client, name: e.target.value },
                })
              }
              placeholder="Ví dụ: Tech Global Logistics"
            />
            <Input
              label="Quốc gia"
              value={form.client.country}
              onChange={e =>
                setForm({
                  ...form,
                  client: { ...form.client, country: e.target.value },
                })
              }
              placeholder="Vietnam, Singapore, USA..."
            />
          </div>
        )}

        <LocalizedField
          label="Lĩnh vực hoạt động (Industry)"
          value={form.client.industry}
          onChange={industry =>
            setForm({
              ...form,
              client: { ...form.client, industry },
            })
          }
        />
      </Card>

      {/* Challenge and Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-fg">Bài toán & Thách thức (Challenge)</h3>
          <LocalizedField
            label="Mô tả thách thức"
            type="textarea"
            rows={5}
            value={form.challenge}
            onChange={challenge => setForm({ ...form, challenge })}
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-fg">Giải pháp Kỹ thuật (Solution)</h3>
          <LocalizedField
            label="Mô tả giải pháp"
            type="textarea"
            rows={5}
            value={form.solution}
            onChange={solution => setForm({ ...form, solution })}
          />
        </Card>
      </div>

      {/* Measurable Results */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-fg">Kết quả & Đo lường Hiệu quả (Results)</h3>
            <p className="text-xs text-fg-muted">
              Các chỉ số định lượng (ví dụ: +99.99% Uptime, 3.5x Throughput).
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addResultMetric}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Thêm chỉ số
          </Button>
        </div>

        <div className="space-y-4">
          {form.results.length === 0 ? (
            <p className="text-xs text-fg-muted text-center py-4 border border-dashed border-border rounded-lg">
              Chưa có chỉ số đo lường nào.
            </p>
          ) : (
            form.results.map((resItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-surface-sunken space-y-3 relative"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-fg">Chỉ số #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeResultMetric(idx)}
                    className="text-danger hover:text-danger/80 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LocalizedField
                    label="Giá trị (Value, e.g. 99.99% / 3.5x)"
                    value={resItem.value}
                    onChange={val => {
                      const updated = [...form.results];
                      updated[idx].value = val;
                      setForm({ ...form, results: updated });
                    }}
                  />
                  <LocalizedField
                    label="Nhãn (Label, e.g. Uptime / Năng lực xử lý)"
                    value={resItem.label}
                    onChange={val => {
                      const updated = [...form.results];
                      updated[idx].label = val;
                      setForm({ ...form, results: updated });
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SEO */}
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
