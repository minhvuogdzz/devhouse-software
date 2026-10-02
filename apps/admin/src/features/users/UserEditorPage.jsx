import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useAuth } from '../../lib/auth-context.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';

export default function UserEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { t, locale } = useI18n();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isSelf = currentUser?._id === id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active',
    roleKeys: [],
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/roles');
      return res.data || [];
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get(`/admin/users/${id}`);
      return res.data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        status: user.status || 'active',
        roleKeys: user.roleKeys || [],
      });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async payload => {
      if (isNew) {
        return apiClient.post('/admin/users', payload);
      }
      return apiClient.patch(`/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: err => {
      setErrorMsg(err.message || 'Error saving user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.roleKeys.length === 0) {
      setErrorMsg(
        locale === 'vi'
          ? 'Người dùng phải có ít nhất một vai trò'
          : 'User must be assigned at least one role',
      );
      return;
    }

    if (isNew && (!formData.password || formData.password.length < 8)) {
      setErrorMsg(
        locale === 'vi'
          ? 'Mật khẩu phải có tối thiểu 8 ký tự'
          : 'Password must be at least 8 characters long',
      );
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      status: formData.status,
      roleKeys: formData.roleKeys,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    saveMutation.mutate(payload);
  };

  const toggleRole = roleKey => {
    const exists = formData.roleKeys.includes(roleKey);
    if (exists) {
      setFormData({
        ...formData,
        roleKeys: formData.roleKeys.filter(r => r !== roleKey),
      });
    } else {
      setFormData({
        ...formData,
        roleKeys: [...formData.roleKeys, roleKey],
      });
    }
  };

  if (!isNew && isLoading) {
    return <div className="p-8 text-fg-muted">{t('common.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {isNew
              ? locale === 'vi'
                ? 'Thêm tài khoản người dùng'
                : 'Create User Account'
              : locale === 'vi'
                ? 'Chỉnh sửa tài khoản người dùng'
                : 'Edit User Account'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {isNew
              ? locale === 'vi'
                ? 'Khởi tạo thông tin đăng nhập và gán vai trò truy cập.'
                : 'Configure credentials and assign system access roles.'
              : user?.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            {t('common.cancel')}
          </Button>
          {!isNew && !isSelf && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (window.confirm(t('common.confirmDelete'))) {
                  deleteMutation.mutate();
                }
              }}
            >
              {t('common.delete')}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-danger-surface text-danger text-sm">{errorMsg}</div>
      )}

      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={locale === 'vi' ? 'Họ và tên' : 'Full Name'}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={
              isNew
                ? locale === 'vi'
                  ? 'Mật khẩu khởi tạo (tối thiểu 8 ký tự)'
                  : 'Initial Password (min 8 chars)'
                : locale === 'vi'
                  ? 'Đặt lại mật khẩu mới (để trống nếu giữ nguyên)'
                  : 'New Password (leave empty to keep existing)'
            }
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required={isNew}
          />

          <Select
            label={t('common.status')}
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            disabled={isSelf}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'disabled', label: 'Disabled' },
            ]}
          />
        </div>
        {isSelf && (
          <p className="text-xs text-fg-muted italic">
            {locale === 'vi'
              ? '* Bạn không thể tự vô hiệu hóa tài khoản đang đăng nhập.'
              : '* You cannot deactivate your own active session.'}
          </p>
        )}

        <div className="space-y-3 pt-4 border-t border-border">
          <label className="block text-sm font-medium text-fg">
            {locale === 'vi' ? 'Phân quyền vai trò (Roles)' : 'Assigned Roles'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map(r => {
              const checked = formData.roleKeys.includes(r.key);
              const label =
                typeof r.name === 'object' ? r.name[locale] || r.name.vi || r.key : r.name || r.key;
              return (
                <label
                  key={r.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? 'border-primary bg-primary-surface/20'
                      : 'border-border bg-surface-raised hover:border-border-focus'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(r.key)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-sm font-semibold text-fg">{label}</div>
                    <div className="text-xs text-fg-muted font-mono">{r.key}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </Card>
    </form>
  );
}
