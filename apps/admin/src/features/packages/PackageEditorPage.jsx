import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ListField } from '../../components/form/ListField.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

const blank = () => ({ vi: '', en: '' });

const EMPTY = {
  name: blank(),
  audience: blank(),
  shortDescription: blank(),
  inclusions: [],
  supportHours: blank(),
  setupFee: '',
  recurringFee: '',
  recurringPeriod: 'year',
  currency: 'VND',
  priceNote: blank(),
  isFeatured: false,
  order: 0,
  status: 'draft',
  seo: { title: blank(), description: blank() },
};

const toNumberOrNull = value => (value === '' || value === null ? null : Number(value));

export default function PackageEditorPage() {
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
        const res = await apiClient(`/admin/packages/${id}`);
        const d = res.data;
        setForm({
          ...EMPTY,
          ...d,
          name: d.name || blank(),
          audience: d.audience || blank(),
          shortDescription: d.shortDescription || blank(),
          supportHours: d.supportHours || blank(),
          priceNote: d.priceNote || blank(),
          inclusions: d.inclusions || [],
          setupFee: d.setupFee ?? '',
          recurringFee: d.recurringFee ?? '',
          seo: { title: d.seo?.title || blank(), description: d.seo?.description || blank() },
        });
        setUpdatedAt(d.updatedAt);
      } catch (err) {
        alert(err.message || 'Không thể tải gói');
        navigate('/packages');
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
      audience: form.audience,
      shortDescription: form.shortDescription,
      inclusions: form.inclusions,
      supportHours: form.supportHours,
      setupFee: toNumberOrNull(form.setupFee),
      recurringFee: toNumberOrNull(form.recurringFee),
      recurringPeriod: form.recurringPeriod,
      currency: form.currency,
      priceNote: form.priceNote,
      isFeatured: form.isFeatured,
      order: parseInt(form.order, 10) || 0,
      status: form.status,
      seo: form.seo,
    };
    try {
      if (isNew) {
        await apiClient('/admin/packages', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiClient(`/admin/packages/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, updatedAt }),
        });
      }
      navigate('/packages');
    } catch (err) {
      const detail = Array.isArray(err.details) ? err.details.map(d => d.message).join('; ') : '';
      setErrorMsg([err.message, detail].filter(Boolean).join(': ') || 'Lỗi khi lưu gói');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xoá gói này? Bạn có thể khôi phục lại sau.')) return;
    setIsDeleting(true);
    try {
      await apiClient(`/admin/packages/${id}`, { method: 'DELETE' });
      navigate('/packages');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xoá gói');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Đang tải thông tin gói...</p>
      </div>
    );
  }

  return (
    <ResourceForm
      title={isNew ? 'Thêm gói dịch vụ mới' : 'Chỉnh sửa gói dịch vụ'}
      subtitle="Gói hiện ở trang Gói dịch vụ. Gói chỉ hiện ở tiếng Anh khi bạn điền đủ tên và mô tả tiếng Anh."
      backUrl="/packages"
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
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Thông tin gói</h3>
        <LocalizedField
          label="Tên gói"
          required
          value={form.name}
          onChange={name => set({ name })}
        />
        <LocalizedField
          label="Dành cho ai (ví dụ: Cửa hàng, quán ăn)"
          value={form.audience}
          onChange={audience => set({ audience })}
        />
        <LocalizedField
          label="Mô tả ngắn"
          type="textarea"
          rows={2}
          value={form.shortDescription}
          onChange={shortDescription => set({ shortDescription })}
        />
        <LocalizedField
          label="Mức giờ hỗ trợ mỗi tháng (ví dụ: Mức trung bình)"
          value={form.supportHours}
          onChange={supportHours => set({ supportHours })}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="border-b border-border pb-3 text-sm font-bold text-fg">Gói gồm những gì</h3>
        <ListField
          items={form.inclusions}
          onChange={inclusions => set({ inclusions })}
          createItem={() => ({ text: blank() })}
          addLabel="Thêm quyền lợi"
          emptyText="Chưa có quyền lợi nào."
          itemTitle={(item, index) => `${index + 1}. ${item.text?.vi || 'Quyền lợi mới'}`}
          renderItem={(item, setItem) => (
            <LocalizedField
              label="Quyền lợi"
              value={item.text}
              onChange={text => setItem({ ...item, text })}
            />
          )}
        />
      </Card>

      <Card className="space-y-6 p-6">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-bold text-fg">Giá</h3>
          <p className="mt-1 text-[11px] text-fg-subtle">
            Để trống các ô giá nếu chưa công bố. Website sẽ hiện “Liên hệ báo giá” thay cho con số.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <Input
            label="Phí cài đặt (một lần)"
            type="number"
            min="0"
            step="1"
            value={form.setupFee}
            onChange={e => set({ setupFee: e.target.value })}
          />
          <Input
            label="Phí duy trì"
            type="number"
            min="0"
            step="1"
            value={form.recurringFee}
            onChange={e => set({ recurringFee: e.target.value })}
          />
          <Select
            label="Thu phí duy trì theo"
            value={form.recurringPeriod}
            onChange={e => set({ recurringPeriod: e.target.value })}
          >
            <option value="quarter">Quý</option>
            <option value="year">Năm</option>
          </Select>
          <Select
            label="Đơn vị tiền"
            value={form.currency}
            onChange={e => set({ currency: e.target.value })}
          >
            <option value="VND">VND (₫)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </Select>
        </div>
        <LocalizedField
          label="Ghi chú về giá (ví dụ: Giá chưa gồm VAT)"
          value={form.priceNote}
          onChange={priceNote => set({ priceNote })}
        />
        <Toggle
          label="Gói nổi bật"
          hint="Hiện nhãn “Nổi bật” và viền xanh trên thẻ gói."
          checked={form.isFeatured}
          onChange={isFeatured => set({ isFeatured })}
        />
        <div className="max-w-xs">
          <Input
            label="Thứ tự hiển thị (nhỏ hiện trước)"
            type="number"
            value={form.order}
            onChange={e => set({ order: e.target.value })}
          />
        </div>
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
