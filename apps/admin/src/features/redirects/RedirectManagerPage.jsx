import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export default function RedirectManagerPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    sourcePath: '',
    targetPath: '',
    statusCode: 301,
    isActive: true,
    note: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: redirects = [], isLoading } = useQuery({
    queryKey: ['redirects'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/redirects');
      return res.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async payload => {
      if (editingItem) {
        return apiClient.patch(`/admin/redirects/${editingItem._id}`, payload);
      }
      return apiClient.post('/admin/redirects', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redirects'] });
      setModalOpen(false);
      setEditingItem(null);
      setErrorMsg('');
    },
    onError: err => {
      setErrorMsg(err.message || 'Error saving redirect');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async id => {
      return apiClient.delete(`/admin/redirects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redirects'] });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      sourcePath: '',
      targetPath: '',
      statusCode: 301,
      isActive: true,
      note: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = item => {
    setEditingItem(item);
    setFormData({
      sourcePath: item.sourcePath || item.from || '',
      targetPath: item.targetPath || item.to || '',
      statusCode: item.statusCode || 301,
      isActive: item.isActive !== false,
      note: item.note || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.sourcePath.startsWith('/')) {
      setErrorMsg(
        locale === 'vi'
          ? 'Đường dẫn nguồn phải bắt đầu bằng dấu gạch chéo (/)'
          : 'Source path must begin with a forward slash (/)',
      );
      return;
    }
    if (formData.sourcePath === formData.targetPath) {
      setErrorMsg(
        locale === 'vi'
          ? 'Đường dẫn đích không được trùng với đường dẫn nguồn (gây lặp vô tận)'
          : 'Target path cannot be identical to source path (infinite loop)',
      );
      return;
    }

    saveMutation.mutate({
      sourcePath: formData.sourcePath,
      targetPath: formData.targetPath,
      statusCode: Number(formData.statusCode),
      isActive: formData.isActive,
      note: formData.note,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Quản lý Điều hướng URL (Redirects)' : 'Redirect Rules'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Cấu hình chuyển hướng 301 (Vĩnh viễn) và 302 (Tạm thời) phục vụ bảo toàn SEO khi đổi URL.'
              : 'Configure HTTP 301 (Permanent) and 302 (Temporary) URL redirects to protect inbound SEO equity.'}
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          + {locale === 'vi' ? 'Thêm quy tắc' : 'Add Rule'}
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-surface-raised border-b border-border text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Đường dẫn nguồn' : 'Source Path'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Đích đến' : 'Target Destination'}
                </th>
                <th className="px-6 py-3 font-semibold">{locale === 'vi' ? 'Mã' : 'Code'}</th>
                <th className="px-6 py-3 font-semibold">{t('common.status')}</th>
                <th className="px-6 py-3 font-semibold">{locale === 'vi' ? 'Ghi chú' : 'Note'}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : redirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                redirects.map(item => (
                  <tr key={item._id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4 font-medium text-fg">
                      {item.sourcePath || item.from}
                    </td>
                    <td className="px-6 py-4 text-fg-muted">{item.targetPath || item.to}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded bg-primary-surface text-primary">
                        {item.statusCode || 301}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive !== false ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Disabled</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-fg-muted max-w-xs truncate">
                      {item.note || '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger hover:bg-danger-surface"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(item._id);
                          }
                        }}
                      >
                        {t('common.delete')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingItem
            ? locale === 'vi'
              ? 'Chỉnh sửa quy tắc chuyển hướng'
              : 'Edit Redirect Rule'
            : locale === 'vi'
              ? 'Thêm quy tắc chuyển hướng mới'
              : 'Add New Redirect Rule'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded bg-danger-surface text-danger text-sm">{errorMsg}</div>
          )}

          <Input
            label={
              locale === 'vi' ? 'Đường dẫn nguồn (bắt đầu bằng /)' : 'Source Path (starts with /)'
            }
            placeholder="/old-service-url"
            value={formData.sourcePath}
            onChange={e => setFormData({ ...formData, sourcePath: e.target.value })}
            required
          />

          <Input
            label={locale === 'vi' ? 'Đích đến (URL hoặc Path)' : 'Target Path or Full URL'}
            placeholder="/services"
            value={formData.targetPath}
            onChange={e => setFormData({ ...formData, targetPath: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={locale === 'vi' ? 'Mã trạng thái HTTP' : 'HTTP Status Code'}
              value={formData.statusCode}
              onChange={e => setFormData({ ...formData, statusCode: Number(e.target.value) })}
              options={[
                { value: 301, label: '301 Permanent Redirect' },
                { value: 302, label: '302 Temporary Redirect' },
              ]}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm text-fg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                {locale === 'vi' ? 'Kích hoạt quy tắc' : 'Rule Active'}
              </label>
            </div>
          </div>

          <Input
            label={locale === 'vi' ? 'Ghi chú lý do chuyển hướng' : 'Internal Note / Reason'}
            placeholder={
              locale === 'vi' ? 'Gộp dịch vụ vào tháng 10' : 'Consolidated legacy service page'
            }
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
